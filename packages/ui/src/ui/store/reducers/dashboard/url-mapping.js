import reduce_ from 'lodash/reduce';

import {getListPreparedState, listParams} from '../operations/list/url-mapping';
import {
    accountsParams,
    getAccountsPreparedState,
} from '../../../store/reducers/accounts/accounts/url-mapping';
import {initialState} from './index';
import {Page} from '../../../constants/index';

const preparedListParams = reduce_(
    listParams,
    (accResult, value, key) => {
        accResult[Page.OPERATIONS + '_' + key] = {...value};
        return accResult;
    },
    {},
);

const preparedAccountsParams = reduce_(
    accountsParams,
    (accResult, value, key) => {
        accResult[Page.ACCOUNTS + '_' + key] = {...value};
        return accResult;
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
    const listState = getListPreparedState(state, location);
    const dashboardState = getAccountsPreparedState(listState, location);

    return dashboardState;
}
