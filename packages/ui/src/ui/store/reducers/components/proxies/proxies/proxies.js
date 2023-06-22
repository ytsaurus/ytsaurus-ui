import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    CHANGE_HOST_FILTER,
    CHANGE_ROLE_FILTER,
    CHANGE_STATE_FILTER,
    GET_PROXIES,
} from '../../../../../constants/components/proxies/proxies';

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    proxies: [],
};

const persistedState = {
    hostFilter: '',
    stateFilter: 'all',
    roleFilter: 'all',
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_PROXIES.REQUEST:
            return {...state, loading: true};

        case GET_PROXIES.SUCCESS: {
            const {proxies} = action.data;

            return {
                ...state,
                proxies,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_PROXIES.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_PROXIES.CANCELLED:
            return {...initialState};

        case CHANGE_HOST_FILTER:
            return {...state, hostFilter: action.data.hostFilter};

        case CHANGE_STATE_FILTER:
            return {...state, stateFilter: action.data.stateFilter};

        case CHANGE_ROLE_FILTER:
            return {...state, roleFilter: action.data.roleFilter};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
