import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.LOCKS);

export const GET_LOCKS = createActionTypes(PREFIX + 'GET_LOCKS');
export const IS_PARTIAL = PREFIX + 'IS_PARTIAL';
export const MAX_TRANSACTIONS_REQUESTS = 100;
