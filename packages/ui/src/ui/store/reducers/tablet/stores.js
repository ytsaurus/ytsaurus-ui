import {LOAD_STORES} from '../../../constants/tablet';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    stores: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOAD_STORES.REQUEST:
            return {...state, loading: true};

        case LOAD_STORES.SUCCESS: {
            const {stores} = action.data;

            return {
                ...state,
                stores,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_STORES.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_STORES.CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};
