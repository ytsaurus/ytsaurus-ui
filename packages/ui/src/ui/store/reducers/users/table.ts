import {USERS_TABLE, USERS_TABLE_DATA_FIELDS} from '../../../constants/users';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {type Action} from 'redux';
import {type ActionD, type YTError} from '../../../types';
import {type OrderType} from '../../../utils/sort-helpers';

export type UsersTableUser = {
    name: string;
    banned: boolean;
    ban_message?: string;
    member_of: string[];
    member_of_closure?: string[];
    transitiveGroups: string[];
    read_request_rate_limit?: number;
    request_queue_size_limit?: number;
    write_request_rate_limit?: number;
    upravlyator_managed?: unknown;
    ldap?: unknown;
    idm: boolean;
    externalSystem?: string;
};

type EphemeralStateType = {
    loaded: boolean;
    loading: boolean;
    error: YTError | null;
    users: UsersTableUser[];
    /** `order` optional: `setUsersPageSorting` may clear sort without sending `order`. */
    sort: {
        column: string;
        order?: OrderType;
    };
};

const ephemeralState: EphemeralStateType = {
    loaded: false,
    loading: false,
    error: null,
    users: [],
    sort: {
        column: 'name',
        order: 'asc',
    },
};

type PersistentStateType = {
    bannedFilter: boolean;
    nameFilter: string;
    groupFilter: string;
};

const persistentState: PersistentStateType = {
    bannedFilter: false,
    nameFilter: '',
    groupFilter: '',
};

export type UsersTableStateType = EphemeralStateType & PersistentStateType;

export const usersTableState: UsersTableStateType = {
    ...ephemeralState,
    ...persistentState,
};

function reducer(state: UsersTableStateType = usersTableState, action: UsersTableAction) {
    switch (action.type) {
        case USERS_TABLE.REQUEST: {
            return {...state, loading: true};
        }
        case USERS_TABLE.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...action.data,
            };
        }
        case USERS_TABLE.FAILURE: {
            return {...state, loading: false, loaded: false, error: action.data};
        }
        case USERS_TABLE.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case USERS_TABLE_DATA_FIELDS: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
}

export type UsersTableAction =
    | Action<typeof USERS_TABLE.REQUEST>
    | ActionD<typeof USERS_TABLE.SUCCESS, {users: UsersTableUser[]}>
    | ActionD<typeof USERS_TABLE.FAILURE, YTError>
    | Action<typeof USERS_TABLE.CANCELLED>
    | ActionD<
          typeof USERS_TABLE_DATA_FIELDS,
          Partial<Pick<UsersTableStateType, 'bannedFilter' | 'nameFilter' | 'groupFilter' | 'sort'>>
      >;

export default mergeStateOnClusterChange(ephemeralState, persistentState, reducer);
