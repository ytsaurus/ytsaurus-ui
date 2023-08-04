import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';

const PREFIX = createPrefix(Page.NAVIGATION);

export const CREATE_DIRECTORY = createActionTypes(PREFIX + 'CREATE_DIRECTORY');
export const OPEN_CREATE_DIRECTORY_POPUP = PREFIX + 'OPEN_CREATE_DIRECTORY_POPUP';
export const CLOSE_CREATE_DIRECTORY_POPUP = PREFIX + 'CLOSE_CREATE_DIRECTORY_POPUP';

export const CREATE_MESSAGE = 'Directory was successfully created';
