import createActionTypes, {createPrefix} from '../../../constants/utils';
import {Tab} from '../../../constants/components/main';
import {Page} from '../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.VERSIONS, 'V2');

export const DISCOVER_VERSIONS = createActionTypes(PREFIX + 'DISCOVER_VERSIONS');
export const CHANGE_VERSION_SUMMARY_PARTIAL = 'CHANGE_VERSION_SUMMARY_PARTIAL';

export const COMPONENTS_VERSIONS_DETAILED_TABLE_ID = 'components/versions/detailed';
export const COMPONENTS_VERSIONS_SUMMARY_TABLE_ID = 'components/versions/summary';
export const POLLING_INTERVAL = 120 * 1000;
export const DEBOUNCE_TIME = 700;
