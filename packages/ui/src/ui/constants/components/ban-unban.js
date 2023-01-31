import createActionTypes, {createPrefix} from '../../constants/utils';
import {Page} from '../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS);

export const OPEN_BAN_MODAL = PREFIX + 'OPEN_BAN_MODAL';
export const CLOSE_BAN_MODAL = PREFIX + 'CLOSE_BAN_MODAL';
export const BAN_ITEM = createActionTypes(PREFIX + 'BAN_ITEM');

export const OPEN_UNBAN_MODAL = PREFIX + 'OPEN_UNBAN_MODAL';
export const CLOSE_UNBAN_MODAL = PREFIX + 'CLOSE_UNBAN_MODAL';
export const UNBAN_ITEM = createActionTypes(PREFIX + 'UNBAN_ITEM');
