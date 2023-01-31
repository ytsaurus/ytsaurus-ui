import {
    LOAD_TRANSACTIONS,
    CHANGE_FILTER,
} from '../../../../../constants/navigation/content/transaction-map';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    transactions: [],
};

const persistedState = {
    filter: '',
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_TRANSACTIONS.REQUEST:
            return {...state, loading: true};

        case LOAD_TRANSACTIONS.SUCCESS: {
            const {transactions} = action.data;

            return {
                ...state,
                transactions,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_TRANSACTIONS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_TRANSACTIONS.CANCELLED:
            return {...initialState};

        case CHANGE_FILTER:
            return {...state, filter: action.data.filter};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
