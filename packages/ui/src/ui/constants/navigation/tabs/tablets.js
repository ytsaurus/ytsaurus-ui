import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.TABLETS);

export const GET_TABLETS = createActionTypes(PREFIX + 'GET_TABLETS');
export const TABLETS_STATE_PARTIAL = 'TABLETS_STATE_PARTIAL';
export const CHANGE_TABLETS_MODE = PREFIX + 'CHANGE_TABLETS_MODE';
export const TOGGLE_HISTOGRAM = PREFIX + 'TOGGLE_HISTOGRAM';
export const CHANGE_ACTIVE_HISTOGRAM = PREFIX + 'CHANGE_ACTIVE_HISTOGRAM';

export const NAVIGATION_TABLETS_TABLE_ID = 'navigation/tablets';
