import _ from 'lodash';

import {initialState} from './index';
import {initialState as tableSortState} from '../../tables';

import {ACCOUNTS_TABLE_ID} from '../../../../constants/accounts/accounts';
import {parseSortState} from '../../../../utils';
import {initialUsageFiltersState} from '../usage/accounts-usage-filters';
import {parseSortStateArray, serializeSortStateArray} from '../../../../utils/url-mapping';
import {RootState} from '../../../../store/reducers';
import produce from 'immer';
import {updateIfChanged} from '../../../../utils/utils';
import {aclFiltersParams, getAclFiltersPreparedState} from '../../acl/url-mapping';

function dateFromStr(numberStr: string) {
    if (!numberStr) {
        return null;
    }

    const v = Number(numberStr);
    if (isNaN(v)) {
        return null;
    }
    return v * 1000;
}

function numberFromDateStr(v: string) {
    if (!v) {
        return null;
    }
    return Math.round(new Date(v).getTime() / 1000);
}

export const accountsParams = {
    filter: {
        stateKey: 'accounts.accounts.activeNameFilter',
        initialState: initialState.activeNameFilter,
    },
    mode: {
        stateKey: 'accounts.accounts.activeContentModeFilter',
        initialState: initialState.activeContentModeFilter,
    },
    medium: {
        stateKey: 'accounts.accounts.activeMediumFilter',
        initialState: initialState.activeMediumFilter,
    },
    sortState: {
        stateKey: `tables.${ACCOUNTS_TABLE_ID}`,
        initialState: {...tableSortState[ACCOUNTS_TABLE_ID]},
        options: {parse: parseSortState},
        type: 'object',
    },
    account: {
        stateKey: 'accounts.accounts.activeAccount',
        initialState: initialState.activeAccount,
    },
    abc: {
        stateKey: 'accounts.accounts.abcServiceFilter.slug',
        initialState: initialState.abcServiceFilter.slug,
    },
};

export function getAccountsPreparedState(state: RootState, {query}: {query: RootState}) {
    const queryAccounts = query.accounts.accounts;
    return produce(state, (draft) => {
        const draftAccounts = draft.accounts.accounts;
        updateIfChanged(draft.tables, ACCOUNTS_TABLE_ID, query.tables[ACCOUNTS_TABLE_ID]);

        updateIfChanged(draftAccounts, 'activeNameFilter', queryAccounts.activeNameFilter);
        updateIfChanged(
            draftAccounts,
            'activeContentModeFilter',
            queryAccounts.activeContentModeFilter,
        );
        updateIfChanged(draftAccounts, 'activeAccount', queryAccounts.activeAccount);
        updateIfChanged(draftAccounts, 'abcServiceFilter', queryAccounts.abcServiceFilter);
    });
}

export const accountOnlyParams = {
    account: {
        stateKey: 'accounts.accounts.activeAccount',
        initialState: initialState.activeAccount,
    },
};

export function getAccountOnlyPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.accounts.accounts,
            'activeAccount',
            query.accounts.accounts.activeAccount,
        );
    });
}

export const accountUsageParams = {
    ...accountOnlyParams,
    page: {
        stateKey: 'accounts.usage.filters.pageIndex',
        initialState: initialUsageFiltersState.pageIndex,
    },
    pathRe: {
        stateKey: 'accounts.usage.filters.pathFilter',
        initialState: initialUsageFiltersState.pathFilter,
    },
    owner: {
        stateKey: 'accounts.usage.filters.ownerFilter',
        initialState: initialUsageFiltersState.ownerFilter,
    },
    snapshot: {
        stateKey: 'accounts.usage.filters.currentSnapshot',
        initialState: initialUsageFiltersState.currentSnapshot,
    },
    sort: {
        stateKey: 'accounts.usage.filters.sortState',
        initialState: initialUsageFiltersState.sortState,
        options: {
            parse: parseSortStateArray,
            serialize: serializeSortStateArray,
        },
    },
    range: {
        stateKey: 'accounts.usage.filters.dateRange',
        initialState: initialUsageFiltersState.dateRange,
        options: {
            parse(v: string) {
                try {
                    const [from, to] = v.split(',');
                    return {
                        from: dateFromStr(from),
                        to: dateFromStr(to),
                    };
                } catch {
                    return {from: null, to: null};
                }
            },
            serialize({from, to}: {from: string; to: string}) {
                return numberFromDateStr(from) + ',' + numberFromDateStr(to);
            },
        },
    },
    rangeType: {
        stateKey: 'accounts.usage.filters.dateRangeType',
        initialState: initialUsageFiltersState.dateRangeType,
    },
    view: {
        stateKey: 'settings.data.global::accounts::accountUsageViewType',
    },
    path: {
        stateKey: 'accounts.usage.filters.treePath',
        initialState: initialUsageFiltersState.treePath,
        options: {
            shouldPush: true,
        },
    },
    b: {
        stateKey: 'accounts.usage.filters.diffFromSnapshot',
        initialState: initialUsageFiltersState.diffFromSnapshot,
    },
    e: {
        stateKey: 'accounts.usage.filters.diffToSnapshot',
        initialState: initialUsageFiltersState.diffToSnapshot,
    },
};

export function getAccountsUsageState(prevState: RootState, {query}: {query: RootState}) {
    const state = getAccountOnlyPreparedState(prevState, {query});
    return produce(state, (draft) => {
        const draftFilters = draft.accounts.usage.filters;
        const queryFilters = query.accounts.usage.filters;

        updateIfChanged(draftFilters, 'pageIndex', queryFilters.pageIndex);
        updateIfChanged(draftFilters, 'pathFilter', queryFilters.pathFilter);
        updateIfChanged(draftFilters, 'ownerFilter', queryFilters.ownerFilter);
        updateIfChanged(draftFilters, 'currentSnapshot', queryFilters.currentSnapshot);
        updateIfChanged(draftFilters, 'sortState', queryFilters.sortState);
        updateIfChanged(draftFilters, 'dateRange', queryFilters.dateRange);
        updateIfChanged(draftFilters, 'dateRangeType', queryFilters.dateRangeType);
        updateIfChanged(draftFilters, 'treePath', queryFilters.treePath);
        updateIfChanged(draftFilters, 'diffFromSnapshot', queryFilters.diffFromSnapshot);
        updateIfChanged(draftFilters, 'diffToSnapshot', queryFilters.diffToSnapshot);
    });
}

export const accountAclParams = {
    ...accountOnlyParams,
    ...aclFiltersParams,
};

export function getAccountsAclState(prevState: RootState, {query}: {query: RootState}) {
    const state = getAclFiltersPreparedState(prevState, {query});
    return produce(state, (draft) => {
        const draftAccounts = draft.accounts.accounts;
        const queryAccounts = query.accounts.accounts;
        updateIfChanged(draftAccounts, 'activeAccount', queryAccounts.activeAccount);
    });
}
