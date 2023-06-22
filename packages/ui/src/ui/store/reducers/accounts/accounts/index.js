import _ from 'lodash';

import {getResponsibleUsers} from '../../../../utils/accounts/index';
import {ACCOUNTS_DATA_FIELDS_ACTION} from '../../../../constants/accounts';
import {initialState as tableSortState} from '../../tables';

import {
    ACCOUNTS_TABLE_ID,
    CHANGE_CONTENT_MODE_FILTER,
    CHANGE_MEDIUM_TYPE_FILTER,
    CHANGE_NAME_FILTER,
    CLOSE_EDITOR_MODAL,
    FETCH_ACCOUNTS_NODES,
    FETCH_ACCOUNTS_RESOURCE,
    FETCH_ACCOUNTS_TOTAL_USAGE,
    FETCH_ACCOUNTS_USABLE,
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
};

export const initialState = {
    ...persistedState,
    ...ephemeralState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_EDITABLE_ACCOUNT.SUCCESS: {
            const {accounts} = state;
            const {account} = action.data;
            const index = _.indexOf(accounts, (x) => x.name === account.name);
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
                showEditor: true,
            };
        }

        case FETCH_ACCOUNTS_RESOURCE.SUCCESS: {
            const responsibleUsers = getResponsibleUsers(action.data.accounts);
            return {
                ...state,
                accounts: action.data.accounts,
                responsibleUsers: responsibleUsers,
                filteredAccounts: action.data.accounts,
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
                usableErrorMessage: 'Could not load usable accounts list. Showing all accounts.',
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
                editableAccount: editableAccount,
                showEditor: true,
            };
        }

        case CLOSE_EDITOR_MODAL: {
            return {...state, showEditor: false, editableAccount: {}};
        }

        case SET_ACCOUNTS_TREE_STATE: {
            return {...state, accountsTreeState: action.data.treeState};
        }

        case SET_ACTIVE_ACCOUNT: {
            return {...state, activeAccount: action.data.account};
        }

        case ACCOUNTS_DATA_FIELDS_ACTION: {
            return {...state, ...action.data};
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
