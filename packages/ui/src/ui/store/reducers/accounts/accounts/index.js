import {getResponsibleUsers} from '../../../../utils/accounts/index';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../../constants/accounts';
import {initialState as tableSortState} from '../../tables';
import i18n from './i18n';

import {
    ACCOUNTS_TABLE_ID,
    CHANGE_CONTENT_MODE_FILTER,
    CHANGE_MEDIUM_TYPE_FILTER,
    CHANGE_NAME_FILTER,
    CLOSE_EDITOR_MODAL,
    FETCH_ACCOUNTS_METADATA,
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
    FETCH_ACTIVE_ACCOUNT,
    FILTER_USABLE_ACCOUNTS,
    OPEN_EDITOR_MODAL,
    SET_ACCOUNTS_TREE_STATE,
    SET_ACTIVE_ACCOUNT,
    UPDATE_EDITABLE_ACCOUNT,
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
    activeAccountFetching: false,
    activeAccountError: undefined,
    editableAccountFetching: false,
    editableAccountError: undefined,
    loadTotals: false,
    loadNodes: false,
    error: false,
    errorData: {},

    accounts: [],
    accountsTreeState: 'collapsed',
    editableAccount: {},
    showEditor: false,
    responsibleUsers: [],
    usableAccounts: [],

    clusterTotalsUsage: {},
    nodesData: {},

    /**
     * The field is used by AccountsUpdater.
     * It should be increased after editing of any account to reload data.
     * see YTFRONT-3920
     */
    editCounter: 0,
    disableCacheForNextFetch: false,

    is_accounts_usage_available: false,
};

export const initialState = {
    ...persistedState,
    ...ephemeralState,
};

// eslint-disable-next-line complexity
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_EDITABLE_ACCOUNT.REQUEST:
            return {
                ...state,
                editableAccount: {name: action.data.accountName},
                editableAccountFetching: true,
                editableAccountError: undefined,
                showEditor: true,
            };

        case UPDATE_EDITABLE_ACCOUNT.SUCCESS: {
            const {accounts} = state;
            const {account} = action.data;
            const index = accounts.findIndex((item) => item.name === account.name);
            const newAccounts = [...accounts];
            if (index === -1) {
                newAccounts.push(account);
            } else {
                newAccounts[index] = account;
            }

            return {
                ...state,
                accounts: newAccounts,
                editableAccount: action.data.account,
                editableAccountFetching: false,
                editableAccountError: undefined,
                showEditor: true,
            };
        }

        case UPDATE_EDITABLE_ACCOUNT.FAILURE:
            return {
                ...state,
                editableAccount: {name: action.data.accountName},
                editableAccountFetching: false,
                editableAccountError: action.data.error,
                showEditor: true,
            };

        case FETCH_ACCOUNTS_RESOURCE.SUCCESS: {
            const accounts = mergeAccountList(state.accounts, action.data.accounts);
            const responsibleUsers = getResponsibleUsers(accounts);
            return {
                ...state,
                accounts,
                responsibleUsers,
                filteredAccounts: accounts,
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
            return {...state, fetching: true};

        case FETCH_ACCOUNTS_METADATA.REQUEST:
            return {...state, metadataFetching: true, metadataError: undefined};

        case FETCH_ACCOUNTS_METADATA.SUCCESS: {
            const accounts = mergeMetadataList(state.accounts, action.data.accounts);
            return {
                ...state,
                accounts,
                responsibleUsers: getResponsibleUsers(accounts),
                metadataFetching: false,
            };
        }

        case FETCH_ACCOUNTS_METADATA.FAILURE:
            return {...state, metadataFetching: false, metadataError: action.data.error};

        case FETCH_ACTIVE_ACCOUNT.REQUEST:
            return {...state, activeAccountFetching: true, activeAccountError: undefined};

        case FETCH_ACTIVE_ACCOUNT.SUCCESS: {
            const accounts = mergeAccount(state.accounts, action.data.account);
            return {
                ...state,
                accounts,
                responsibleUsers: getResponsibleUsers(accounts),
                activeAccountFetching: false,
            };
        }

        case FETCH_ACTIVE_ACCOUNT.FAILURE:
            return {...state, activeAccountFetching: false, activeAccountError: action.data.error};

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
            };

        case FETCH_ACCOUNTS_USABLE.FAILURE:
            return {
                ...state,
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

        case OPEN_EDITOR_MODAL: {
            const editableAccount = action.data.account;

            return {
                ...state,
                editableAccount,
                showEditor: true,
            };
        }

        case CLOSE_EDITOR_MODAL: {
            return {
                ...state,
                showEditor: false,
                editableAccount: {},
                editableAccountFetching: false,
                editableAccountError: undefined,
            };
        }

        case SET_ACCOUNTS_TREE_STATE: {
            return {...state, accountsTreeState: action.data.treeState};
        }

        case SET_ACTIVE_ACCOUNT: {
            return {
                ...state,
                activeAccount: action.data.account,
                activeAccountFetching: false,
                activeAccountError: undefined,
                metadataError: undefined,
            };
        }

        case ACCOUNTS_DATA_FIELDS_ACTION: {
            return {...state, ...action.data};
        }

        default:
            return state;
    }
};

function mergeAccountList(currentAccounts, listAccounts) {
    const currentByName = new Map(currentAccounts.map((account) => [account.name, account]));
    return listAccounts.map((account) => {
        const current = currentByName.get(account.name);
        if (!current?.$attributes?.resource_usage) {
            return account;
        }

        const merged = Object.assign(Object.create(Object.getPrototypeOf(current)), current);
        merged.$attributes = {...current.$attributes, ...account.$attributes};
        merged.parent = account.parent;
        return merged;
    });
}

function mergeMetadataList(currentAccounts, metadataAccounts) {
    const metadataByName = new Map(metadataAccounts.map((account) => [account.name, account]));
    return currentAccounts.map((account) => metadataByName.get(account.name) || account);
}

function mergeAccount(accounts, updatedAccount) {
    const index = accounts.findIndex((account) => account.name === updatedAccount.name);
    if (index === -1) {
        return [...accounts, updatedAccount];
    }
    const result = [...accounts];
    result[index] = updatedAccount;
    return result;
}

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
