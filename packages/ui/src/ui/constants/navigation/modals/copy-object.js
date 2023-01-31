import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const COPY_OBJECT = createActionTypes(PREFIX + 'COPY_OBJECT');
export const OPEN_COPY_OBJECT_POPUP = PREFIX + 'OPEN_COPY_OBJECT_POPUP';
export const CLOSE_COPY_OBJECT_POPUP = PREFIX + 'CLOSE_COPY_OBJECT_POPUP';
