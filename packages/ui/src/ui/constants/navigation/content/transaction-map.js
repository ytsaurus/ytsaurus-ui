import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.CONTENT, 'TRANSACTION_MAP');

export const LOAD_TRANSACTIONS = createActionTypes(PREFIX + 'LOAD_TRANSACTIONS');
export const CHANGE_FILTER = PREFIX + 'CHANGE_FILTER';

export const NAVIGATION_TRANSACTION_MAP_TABLE_ID = 'navigation/content/transaction-map';
