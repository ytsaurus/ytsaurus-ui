import createActionTypes, {createPrefix} from '../constants/utils';
import {Page} from '../constants/index';

const PREFIX = createPrefix(Page.PATH_VIEWER);

export const LOAD_DATA = createActionTypes(PREFIX + 'LOAD_DATA');
export const CHANGE_PARAMETERS = PREFIX + 'CHANGE_PARAMETERS';
export const TOGGLE_PARAMETERS = PREFIX + 'TOGGLE_PARAMETERS';

export const COMMAND = {
    GET: 'get',
    LIST: 'list',
};
