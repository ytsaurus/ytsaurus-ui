import {
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    OPEN_BAN_MODAL,
    OPEN_UNBAN_MODAL,
} from '../../../constants/components/ban-unban';

export function openBanModal(host) {
    return {
        type: OPEN_BAN_MODAL,
        data: {host},
    };
}

export function closeBanModal() {
    return {
        type: CLOSE_BAN_MODAL,
    };
}

export function openUnbanModal(host) {
    return {
        type: OPEN_UNBAN_MODAL,
        data: {host},
    };
}

export function closeUnbanModal() {
    return {
        type: CLOSE_UNBAN_MODAL,
    };
}
