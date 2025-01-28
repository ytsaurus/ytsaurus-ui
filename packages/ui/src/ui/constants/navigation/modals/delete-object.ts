import {Page} from '../../../constants/index';
import createActionTypes, {createPrefix} from '../../../constants/utils';

const PREFIX = createPrefix(Page.NAVIGATION);

export const DELETE_OBJECT = createActionTypes(`${PREFIX}DELETE_OBJECT`);
export const LOAD_REAL_PATH = createActionTypes(`${PREFIX}LOAD_REAL_PATH`);
export const OPEN_DELETE_OBJECT_POPUP = `${PREFIX}OPEN_DELETE_OBJECT_POPUP` as const;
export const CLOSE_DELETE_OBJECT_POPUP = `${PREFIX}CLOSE_DELETE_OBJECT_POPUP` as const;
export const TOGGLE_PERMANENTLY_DELETE = `${PREFIX}TOGGLE_PERMANENTLY_DELETE` as const;

export const SUPPRESS_REDIRECT = '&';
