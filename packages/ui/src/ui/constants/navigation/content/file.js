import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.CONTENT, 'FILE');

export const LOAD_FILE = createActionTypes(PREFIX + 'LOAD_FILE');
export const MAX_FILE_SIZE = 5 * 16 * 1024;
