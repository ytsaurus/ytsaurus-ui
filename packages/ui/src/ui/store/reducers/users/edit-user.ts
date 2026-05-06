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

type EditUserPersistantState = Record<string, unknown>;

export type UsersEditUserState = EditUserEphemeralState & EditUserPersistantState;

const ephemeralState: EditUserEphemeralState = {
    loaded: false,
    loading: false,
    error: null,
    showModal: false,
    username: '',
    data: {},
};

const persistantState: EditUserPersistantState = {};

export const usersEditUserState: UsersEditUserState = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(
    state: UsersEditUserState = usersEditUserState,
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

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
