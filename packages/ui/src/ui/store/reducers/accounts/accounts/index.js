import Account from '../../../../pages/accounts/selector';
import {getResponsibleUsers} from '../../../../utils/accounts/index';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../../constants/accounts';
import {initialState as tableSortState} from '../../tables';
import i18n from './i18n';

import {
    ACCOUNTS_TABLE_ID,
    CHANGE_CONTENT_MODE_FILTER,
    CHANGE_MEDIUM_TYPE_FILTER,
    CHANGE_NAME_FILTER,
    FETCH_ACCOUNTS_METADATA,
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
    FILTER_USABLE_ACCOUNTS,
    SET_ACCOUNTS_TREE_STATE,
    SET_ACTIVE_ACCOUNT,
} from '../../../../constants/accounts/accounts';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';

const persistedState = {
    activeAccount: '',
    activeNameFilter: '',
    activeContentModeFilter: 'default',
    masterMemoryContentMode: 'total', // 'total' | 'per_cell' | 'chunk_host'
    activeMediumFilter: 'default',
    sortState: tableSortState[ACCOUNTS_TABLE_ID],
    abcServiceFilter: {slug: undefined},
};

const ephemeralState = {
    fetching: false,
    wasLoaded: false,
    metadataFetching: false,
    metadataError: undefined,
    loadTotals: false,
    loadNodes: false,
    error: false,
    errorData: {},

    accounts: [],
    accountList: [],
    accountsTreeState: 'collapsed',
    responsibleUsers: [],
    usableAccounts: [],

    clusterTotalsUsage: {},
    nodesData: {},

    /**
     * The field is used by AccountsUpdater.
     * It should be increased after editing of any account to reload data.
     * see YTFRONT-3920
     */

    is_accounts_usage_available: false,
};

export const initialState = {
    ...persistedState,
    ...ephemeralState,
};

function mergeAccountsWithLoadedDetails(accounts, previousAccounts) {
    const previousAccountsByName = new Map(
        previousAccounts.map((account) => [account.name, account]),
    );
    return accounts.map((account) => {
        const details = previousAccountsByName.get(account.name);
        if (!details) return account;

        return new Account({
            ...details,
            parent: account.parent,
            abc: account.abc,
            $attributes: {...details.$attributes, ...account.$attributes},
        });
    });
}

// eslint-disable-next-line complexity
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_ACCOUNTS_RESOURCE.SUCCESS: {
            const accounts = mergeAccountsWithLoadedDetails(action.data.accounts, state.accounts);
            const responsibleUsers = getResponsibleUsers(accounts);
            return {
                ...state,
                accounts,
                responsibleUsers,
                accountList: action.data.accounts,
                fetching: false,
                error: false,
                wasLoaded: true,
            };
        }

        case FETCH_ACCOUNTS_RESOURCE.FAILURE:
            return {
                ...state,
                fetching: false,
                error: true,
                errorData: action.data.error,
            };

        case FETCH_ACCOUNTS_RESOURCE.REQUEST:
            return {...state, fetching: true, metadataFetching: false, metadataError: undefined};

        case FETCH_ACCOUNTS_METADATA.REQUEST:
            return {
                ...state,
                accounts: mergeAccountsWithLoadedDetails(
                    state.accountList,
                    action.data.accountNames === undefined
                        ? state.accounts
                        : state.accounts.filter(({name}) => action.data.accountNames.has(name)),
                ),
                metadataFetching: true,
                metadataError: undefined,
            };

        case FETCH_ACCOUNTS_METADATA.SUCCESS: {
            const accounts = action.data.allAccounts
                ? action.data.accounts
                : mergeAccountsWithLoadedDetails(state.accountList, action.data.accounts);
            return {
                ...state,
                accounts,
                responsibleUsers: getResponsibleUsers(accounts),
                metadataFetching: false,
                metadataError: action.data.error,
            };
        }

        case FETCH_ACCOUNTS_METADATA.FAILURE:
            return {...state, metadataFetching: false, metadataError: action.data.error};

        case FETCH_ACCOUNTS_TOTAL_USAGE.SUCCESS:
            return {
                ...state,
                clusterTotalsUsage: action.data,
                loadTotals: true,
            };

        case FETCH_ACCOUNTS_TOTAL_USAGE.FAILURE:
            return {...state, totalsError: action.data.error};

        case FETCH_ACCOUNTS_NODES.SUCCESS:
            return {
                ...state,
                nodesData: action.data,
                loadNodes: true,
            };

        case FETCH_ACCOUNTS_NODES.FAILURE:
            return {...state, totalsError: action.data.error};

        case FETCH_ACCOUNTS_USABLE.SUCCESS:
            return {
                ...state,
                usableAccounts: action.data,
                usableError: undefined,
                usableErrorMessage: undefined,
            };

        case FETCH_ACCOUNTS_USABLE.FAILURE:
            return {
                ...state,
                usableAccounts: [],
                usableError: action.data.error,
                usableErrorMessage: i18n('alert_usable-accounts-load-error'),
            };

        case CHANGE_NAME_FILTER: {
            const {newFilter} = action.data;

            return {...state, activeNameFilter: newFilter};
        }

        case CHANGE_CONTENT_MODE_FILTER: {
            const {newFilter} = action.data;

            return {...state, activeContentModeFilter: newFilter};
        }

        case CHANGE_MEDIUM_TYPE_FILTER: {
            const {newFilter} = action.data;

            return {...state, activeMediumFilter: newFilter};
        }

        case FILTER_USABLE_ACCOUNTS: {
            return {...state, activeUsableFilter: true};
        }

        case SET_ACCOUNTS_TREE_STATE: {
            return {...state, accountsTreeState: action.data.treeState};
        }

        case SET_ACTIVE_ACCOUNT: {
            return {
                ...state,
                activeAccount: action.data.account,
            };
        }

        case ACCOUNTS_DATA_FIELDS_ACTION: {
            return {...state, ...action.data};
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
