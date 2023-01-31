import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const RESTORE_OBJECT = createActionTypes(PREFIX + 'RESTORE_OBJECT');
export const OPEN_RESTORE_POPUP = PREFIX + 'OPEN_RESTORE_POPUP';
export const CLOSE_RESTORE_POPUP = PREFIX + 'CLOSE_RESTORE_POPUP';

export const INITIAL_STEP = 1;
