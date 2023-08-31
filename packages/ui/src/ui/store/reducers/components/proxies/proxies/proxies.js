import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    GET_PROXIES,
    PROXIES_CHANGE_FILTERS,
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
    /**
     * @type {'all' | 'true' | 'false'}
     */
    bannedFilter: 'all',
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

        case PROXIES_CHANGE_FILTERS:
            return {...state, ...action.data};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
