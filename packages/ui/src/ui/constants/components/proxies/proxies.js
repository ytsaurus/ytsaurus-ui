import createActionTypes, {createPrefix} from '../../../constants/utils';
import {Tab} from '../../../constants/components/main';
import {Page} from '../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.HTTP_PROXIES);

export const GET_PROXIES = createActionTypes(PREFIX + 'GET_PROXIES');
export const PROXIES_CHANGE_FILTERS = PREFIX + 'PROXIES_CHANGE_FILTERS';

export const COMPONENTS_PROXIES_TABLE_ID = 'components/proxies';
export const POLLING_INTERVAL = 30 * 1000;
export const SPLIT_TYPE = 'proxy-card';
export const PROXY_TYPE = {
    HTTP: 'http',
    RPC: 'rpc',
    CYPRESS: 'cypress',
};
