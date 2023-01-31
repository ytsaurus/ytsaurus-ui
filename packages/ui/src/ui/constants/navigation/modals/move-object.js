import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const MOVE_OBJECT = createActionTypes(PREFIX + 'MOVE_OBJECT');
export const OPEN_MOVE_OBJECT_POPUP = PREFIX + 'OPEN_RENAME_OBJECT_POPUP';
export const CLOSE_MOVE_OBJECT_POPUP = PREFIX + 'CLOSE_MOVE_OBJECT_POPUP';
