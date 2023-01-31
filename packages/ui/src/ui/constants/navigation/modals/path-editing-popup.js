import {createPrefix} from '../../utils';
import {Page} from '../../index';

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
    [NetworkCode.EXIST]: 'Object with the same path already exists. Please, try another one',
    [NetworkCode.INCORRECT_PATH]: 'This path is not correct',
    [NetworkCode.NETWORK_ERROR]: 'Network error. Please, try again later',
    [NetworkCode.ACCESS_DENIED]: 'Access denied',
    [NetworkCode.MOUNT_ERROR]:
        'Cannot move / copy dynamic table since not all tablets are unmounted',
    [NetworkCode.NODE_COUNT_LIMIT]: 'Account is over Cypress node count limit',
    DEFAULT: 'Oops! something went wrong',
};
