import createActionTypes, {createPrefix} from '../constants/utils';
import {Page} from '../constants/index';

const PREFIX = createPrefix(Page.TABLET);

export const LOAD_TABLET_DATA = createActionTypes(PREFIX + 'LOAD_TABLET_DATA');
export const LOAD_STORES = createActionTypes(PREFIX + 'LOAD_STORES');
export const CHANGE_CONTENT_MODE = PREFIX + 'CHANGE_CONTENT_MODE';
export const CHANGE_ACTIVE_HISTOGRAM = PREFIX + 'CHANGE_ACTIVE_HISTOGRAM';

export const TABLET_PARTITIONS_TABLE_ID = 'tablet/partitions';
export const TABLET_PARTITION_STORES_TABLE_ID = 'tablet/partition/stores';
