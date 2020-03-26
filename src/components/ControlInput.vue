<template>
    <grid-layout class="controlinput p-t-5" rows="*" columns="50, *">
        <user-avatar
            col="0"
            class="controlinput-avatar m-l-10"
            :nick="currentNick"
            :status="userStatus"
            @tap="openSelfUser"
        />
        <text-field
            col="1"
            id="control-text-field"
            v-model="input"
            class="controlinput-input m-r-10"
            ref="textInput"
            @textChange="checkAutoComplete"
            hint="asdasd asd asdasd"
            returnKeyType="send"
            @returnPress="send"
            @loaded="initTextField"
            @unloaded="blur"
            backgroundColor="red"
        />
    </grid-layout>
</template>

<script>
import { isIOS, isAndroid } from 'tns-core-modules/platform';

import { InputAccessoryView } from '~/components/commons/InputAccessoryView';

import Logger from '@/libs/Logger';
import { createNickColour } from '@/helpers/TextFormatting';
import UserAvatar from './UserAvatar';

const log = Logger.namespace('ControlInput');
log.setLevel(2);

/**
 * Sample of a user avatar component replacement.
 * Changes the background color to red!
 */

export default {
    components: { UserAvatar },
    props: ['buffer'],
    data() {
        return {
            input: '',
            history: [],
        };
    },
    computed: {
        currentNick() {
            return this.network ? this.network.nick : '';
        },
        network() {
            return this.$state.getActiveNetwork();
        },
        allAutoCompleteItems() {
            const users = this.buffer.users;
            const buffers = this.$state.getActiveNetwork().buffers;
            let list = [];

            let userList = _.values(users).map(user => {
                let item = {
                    text: user.nick,
                    type: 'user',
                };
                return item;
            });

            if (this.buffer.isQuery()) {
                userList.push({
                    text: this.buffer.name,
                    type: 'user',
                });
            }

            list = list.concat(userList);

            let bufferList = [];
            this.buffer.getNetwork().buffers.forEach(buffer => {
                if (buffer.isChannel()) {
                    bufferList.push({
                        text: buffer.name,
                        type: 'buffer',
                    });
                }
            });

            list = list.concat(bufferList);

            return list;
        },
        userStatus() {
            if (this.network.state === 'disconnected') {
                return 'disconnected';
            } else if (
                this.network.currentUser().away ||
                this.network.state === 'connecting'
            ) {
                return 'away';
            }

            return 'connected';
        },
    },
    methods: {
        initTextField(event) {
            if (isIOS) {
                const nativeTextField = event.object.ios;
                nativeTextField.inputAccessoryView = InputAccessoryView.init();
            }

            if (isAndroid) {
                const view = event.object;
                var that = new WeakRef(view);
                const editorActionListener = new android.widget.TextView.OnEditorActionListener(
                    {
                        onEditorAction: function(textView, actionId, event) {
                            var owner = that.get();
                            if (owner) {
                                if (
                                    actionId ===
                                        android.view.inputmethod.EditorInfo
                                            .IME_ACTION_SEND ||
                                    (event &&
                                        event.getKeyCode() ===
                                            android.view.KeyEvent.KEYCODE_ENTER)
                                ) {
                                    owner._onReturnPress();
                                    return true;
                                }
                            }
                            return false;
                        },
                    }
                );
                view.android.setOnEditorActionListener(editorActionListener);
            }
        },
        openSelfUser() {
            this.$state.$emit('user-settings.show');
        },
        send(event) {
            if (this.input === '') {
                return;
            }

            log('sending ', this.input);
            this.$state.$emit('input.raw', this.input);

            // Add to history, keeping the history trimmed to the last 50 entries
            this.history.push(this.input);
            this.history.splice(0, this.history.length - 50);
            this.history_pos = this.history.length;

            this.input = '';
        },
        applyAutoComplete(item) {
            const currentCursorPosition = this.getCursorPosition();
            const currentWord = this.getCurrentWord();
            const currentInput = this.input;

            let insertString = item.text;
            if (item.type === 'user') {
                insertString = item.text + ' ';
                if (currentCursorPosition - currentWord.position === 0) {
                    insertString = item.text + ': ';
                }
            }

            this.input =
                currentInput.substr(
                    0,
                    currentCursorPosition - currentWord.position
                ) +
                insertString +
                currentInput.substr(currentCursorPosition);

            this.$nextTick(() => {
                this.setCursorPosition(
                    currentCursorPosition +
                        insertString.length -
                        currentWord.position
                );
            });
        },
        insertNick(nick) {
            const currentCursorPosition = this.getCursorPosition();
            const currentInput = this.input;

            let insertString = nick + ' ';
            if (currentCursorPosition === 0) {
                insertString = nick + ': ';
            }

            this.input =
                currentInput.substr(0, currentCursorPosition) +
                insertString +
                currentInput.substr(currentCursorPosition);

            this.$nextTick(() => {
                this.$refs.textInput.nativeView.focus();
                this.setCursorPosition(
                    currentCursorPosition + insertString.length
                );
            });
        },
        getCursorPosition() {
            const nativeView = this.$refs.textInput.nativeView;
            if (isIOS) {
                const beginOfDoc = nativeView.ios.beginningOfDocument;
                const selectedRange = nativeView.ios.selectedTextRange;
                const cursorPos = nativeView.ios.offsetFromPositionToPosition(
                    beginOfDoc,
                    selectedRange.start
                );
                return cursorPos;
            }

            return nativeView.android.getSelectionEnd();
        },
        setCursorPosition(position) {
            const nativeView = this.$refs.textInput.nativeView;
            if (isIOS) {
                try {
                    const beginOfDoc = nativeView.ios.beginningOfDocument;
                    const textPosition = nativeView.ios.positionFromPositionOffset(
                        beginOfDoc,
                        position
                    );
                    nativeView.ios.selectedTextRange = nativeView.ios.textRangeFromPositionToPosition(
                        textPosition,
                        textPosition
                    );
                } catch (e) {
                    console.log(e);
                }
            }
            try {
                nativeView.android.setSelection(position);
            } catch (e) {}
        },
        checkAutoComplete(event) {
            setTimeout(() => {
                const currentWord = this.getCurrentWord();
                if (currentWord.word.length === 0) {
                    this.$emit('updateAutoCompleteItems', []);
                    return;
                }

                const currentAutoCompleteItems = this.allAutoCompleteItems.filter(
                    item => {
                        return (
                            item.text
                                .toLowerCase()
                                .startsWith(currentWord.word.toLowerCase()) &&
                            item.text.toLowerCase() !==
                                currentWord.word.toLowerCase()
                        );
                    }
                );

                this.$emit('updateAutoCompleteItems', currentAutoCompleteItems);
            }, 10);
        },
        getCurrentWord() {
            return this.getWordAtPosition(this.input, this.getCursorPosition());
        },
        getWordAtPosition(text, position) {
            let startVal = text.substring(0, position);
            let space = startVal.lastIndexOf(' ');
            if (space === -1) {
                space = 0;
            } else {
                // include the space after the word
                space++;
            }
            let startPos = space;

            space = text.indexOf(' ', startPos);
            if (space === -1) space = text.length;
            let endPos = space;

            return {
                word: text.substring(startPos, endPos),
                position: position - startPos,
            };
        },
        blur() {
            log('huhu when I hear heavy metal!');
            const nativeView = this.$refs.textInput.nativeView;
            this.$refs.user_filter.nativeView.dismissSoftInput();
        },
    },
    created() {
        this.listen(this.$state, 'controlinput.insertNick', nick => {
            this.insertNick(nick);
        });
    },
};
</script>

<style lang="scss">
.controlinput {
    height: 60;
}
.controlinput-avatar {
    horizontal-align: left;
}

.controlinput-input {
    height: 40;
    border-radius: 20;
    padding: 0 10;
    font-size: 15;
    line-height: 15;
    margin-top: -8;
}

button.controlinput-send {
    background-color: transparent;
    border-width: 1;
    border-color: transparent;
    font-size: 30;
    padding: 0;
    margin: 0 10;
    width: 40;
}

/* User Avatar */
.user-avatar {
    &-image {
        border-color: var(--neutral2);
        background-color: var(--neutral5);
    }
}
</style>
