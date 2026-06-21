import {createPrefix} from '../../utils';
import {Page} from '../../index';
import i18n from './i18n';

const PREFIX = createPrefix(Page.NAVIGATION);

export const SHOW_ERROR = PREFIX + 'SHOW_ERROR';
export const HIDE_ERROR = PREFIX + 'HIDE_ERROR';
export const SET_PATH = PREFIX + 'SET_PATH';

export const NetworkCode = {
    EXIST: 501,
    INCORRECT_PATH: 500,
    ACCESS_DENIED: 901,
    NETWORK_ERROR: 0,
    MOUNT_ERROR: 1706,
    NODE_COUNT_LIMIT: 902,
};

export const ErrorMessage = {
    get [NetworkCode.EXIST]() {
        return i18n('alert_path-already-exists');
    },
    get [NetworkCode.INCORRECT_PATH]() {
        return i18n('alert_incorrect-path');
    },
    get [NetworkCode.NETWORK_ERROR]() {
        return i18n('alert_network-error');
    },
    get [NetworkCode.ACCESS_DENIED]() {
        return i18n('alert_access-denied');
    },
    get [NetworkCode.MOUNT_ERROR]() {
        return i18n('alert_mount-error');
    },
    get [NetworkCode.NODE_COUNT_LIMIT]() {
        return i18n('alert_node-count-limit');
    },
    get DEFAULT() {
        return i18n('alert_unknown-error');
    },
};
