import {USERS_TABLE, USERS_TABLE_DATA_FIELDS} from '../../../constants/users';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const ephemeralState = {
    loaded: false,
    loading: false,
    error: null,
    users: [],
    sort: {
        column: 'name',
        order: 'asc',
    },
};

const persistantState = {
    bannedFilter: false,
    nameFilter: '',
    groupFilter: '',
};

export const usersTableState = {
    ...ephemeralState,
    ...persistantState,
};

function reducer(state = usersTableState, {type, data}) {
    switch (type) {
        case USERS_TABLE.REQUEST: {
            return {...state, loading: true};
        }
        case USERS_TABLE.SUCCESS: {
            return {
                ...state,
                loading: false,
                loaded: true,
                error: null,
                ...data,
            };
        }
        case USERS_TABLE.FAILURE: {
            return {...state, loading: false, loaded: false, error: data};
        }
        case USERS_TABLE.CANCELLED: {
            return {...state, loading: false, loaded: false, error: null};
        }
        case USERS_TABLE_DATA_FIELDS: {
            return {...state, ...data};
        }
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(ephemeralState, persistantState, reducer);
