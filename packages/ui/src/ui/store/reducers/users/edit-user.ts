import {USERS_EDIT_USER, USERS_EDIT_USER_DATA_FIELDS} from '../../../constants/users';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {type Action} from 'redux';
import {type ActionD, type YTError} from '../../../types';
import {type UsersTableUser} from './table';

type EditUserEphemeralState = {
    loaded: boolean;
    loading: boolean;
    error: YTError | null;
    showModal: boolean;
    username: string;
    data: Partial<UsersTableUser>;
};

type EditUserPersistentState = Record<string, unknown>;

export type UsersEditUserState = EditUserEphemeralState & EditUserPersistentState;

const ephemeralDefaultState: EditUserEphemeralState = {
    loaded: false,
    loading: false,
    error: null,
    showModal: false,
    username: '',
    data: {},
};

const persistentDefaultState: EditUserPersistentState = {};

export const usersEditUserDefaultState: UsersEditUserState = {
    ...ephemeralDefaultState,
    ...persistentDefaultState,
};

function reducer(
    state: UsersEditUserState = usersEditUserDefaultState,
    action: UsersEditUserAction,
): UsersEditUserState {
    switch (action.type) {
        case USERS_EDIT_USER.REQUEST: {
            return {...state, loading: true};
        }
        case USERS_EDIT_USER.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...action.data,
            };
        }
        case USERS_EDIT_USER.FAILURE: {
            return {...state, loading: false, loaded: false, error: action.data};
        }
        case USERS_EDIT_USER.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case USERS_EDIT_USER_DATA_FIELDS: {
            return {...state, ...action.data};
        }
        default:
            return state;
    }
}

export type UsersEditUserAction =
    | Action<typeof USERS_EDIT_USER.REQUEST>
    | ActionD<typeof USERS_EDIT_USER.SUCCESS, Partial<UsersEditUserState>>
    | ActionD<typeof USERS_EDIT_USER.FAILURE, YTError>
    | Action<typeof USERS_EDIT_USER.CANCELLED>
    | ActionD<typeof USERS_EDIT_USER_DATA_FIELDS, Partial<UsersEditUserState>>;

export default mergeStateOnClusterChange(ephemeralDefaultState, persistentDefaultState, reducer);
