import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.TABLET_ERRORS);

export const GET_TABLET_ERRORS = createActionTypes(`${PREFIX}GET_TABLET_ERRORS`);

export const TABLET_ERRORS_ALL_METHODS = [
    'Execute',
    'Multiread',
    'PullRows',
    'GetTabletInfo',
    'ReadDynamicStore',
    'FetchTabletStores',
    'FetchTableRows',
    'GetOrderedTabletSafeTrimRowCount',
    'Write',
    'Trim',
].map((value) => ({value, text: value}));
