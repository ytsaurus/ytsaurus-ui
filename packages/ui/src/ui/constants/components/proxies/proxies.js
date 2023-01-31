import createActionTypes, {createPrefix} from '../../../constants/utils';
import {Tab} from '../../../constants/components/main';
import {Page} from '../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.HTTP_PROXIES);

export const GET_PROXIES = createActionTypes(PREFIX + 'GET_PROXIES');
export const CHANGE_HOST_FILTER = PREFIX + 'CHANGE_HOST_FILTER';
export const CHANGE_STATE_FILTER = PREFIX + 'CHANGE_STATE_FILTER';
export const CHANGE_ROLE_FILTER = PREFIX + 'CHANGE_ROLE_FILTER';

export const COMPONENTS_PROXIES_TABLE_ID = 'components/proxies';
export const POLLING_INTERVAL = 30 * 1000;
export const SPLIT_TYPE = 'proxy-card';
export const PROXY_TYPE = {
    HTTP: 'http',
    RPC: 'rpc',
};
export const ROLE_THEME = {
    default: 'default',
    control: 'default',
    data: 'default',
};
export const STATE_THEME = {
    online: 'success',
    offline: 'danger',
};
