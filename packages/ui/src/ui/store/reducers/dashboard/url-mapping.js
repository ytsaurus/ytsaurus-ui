import _ from 'lodash';

import {listParams, getListPreparedState} from '../operations/list/url-mapping';
import {
    accountsParams,
    getAccountsPreparedState,
} from '../../../store/reducers/accounts/accounts/url-mapping';
import {initialState} from './index';
import {Page} from '../../../constants/index';

const preparedListParams = _.reduce(
    listParams,
    (result, value, key) => {
        result[Page.OPERATIONS + '_' + key] = {...value};
        return result;
    },
    {},
);

const preparedAccountsParams = _.reduce(
    accountsParams,
    (result, value, key) => {
        result[Page.ACCOUNTS + '_' + key] = {...value};
        return result;
    },
    {},
);

const linksParams = {
    links: {
        stateKey: 'dashboard.activeTab',
        initialState: initialState.activeTab,
    },
};

export const dashboardParams = {
    ...linksParams,
    ...preparedListParams,
    ...preparedAccountsParams,
};

export function getDashboardPreparedState(state, location) {
    state = getListPreparedState(state, location);
    state = getAccountsPreparedState(state, location);

    return state;
}
