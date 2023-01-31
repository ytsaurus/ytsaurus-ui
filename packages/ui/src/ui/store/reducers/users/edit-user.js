import {USERS_EDIT_USER, USERS_EDIT_USER_DATA_FIELDS} from '../../../constants/users';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const ephemeralState = {
    loaded: false,
    loading: false,
    error: null,
    showModal: false,
    username: '',
    data: {},
};

const persistantState = {};

export const usersTableState = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state = usersTableState, {type, data}) {
    switch (type) {
        case USERS_EDIT_USER.REQUEST: {
            return {...state, loading: true};
        }
        case USERS_EDIT_USER.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...data,
            };
        }
        case USERS_EDIT_USER.FAILURE: {
            return {...state, loading: false, loaded: false, error: data};
        }
        case USERS_EDIT_USER.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case USERS_EDIT_USER_DATA_FIELDS: {
            return {...state, ...data};
        }
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
