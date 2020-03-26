import UserAvatar from './UserAvatar';
import ControlInput from './ControlInput';

export function run(kiwi) {
    // Replace every instance of the UserAvatar with our own component
    kiwi.replaceModule('mobile/components/UserAvatar', UserAvatar);
    kiwi.replaceModule('mobile/components/ControlInput', ControlInput);
}
