import { createNickColour } from '@/helpers/TextFormatting';

/**
 * Sample of a user avatar component replacement.
 * Changes the background color to blue!
 */

export default {
    functional: true,
    render(createElement, context) {
        let avatarText = '';

        //if (!context.props.nick) {
        avatarText = '';
        // } else if (!context.props.avatarPic) {
        //     avatarText = context.props.nick.charAt(0).toUpperCase();
        // }

        return createElement(
            'absolute-layout',
            {
                class: ['user-avatar', context.props.size],
                on: context.listeners,
            },
            [
                createElement('label', {
                    class: [
                        'user-avatar-image',
                        context.props.status,
                        {
                            fas: context.props.status === 'disconnected',
                            'user-icon':
                                context.props.status === 'disconnected',
                        },
                    ],
                    attrs: {
                        backgroundColor: 'blue', //createNickColour(context.props.nick),
                        backgroundImage: context.props.avatarPic,
                        text: avatarText,
                    },
                }),
                createElement('label', {
                    class: ['user-avatar-status', context.props.status],
                }),
            ]
        );
    },
};
