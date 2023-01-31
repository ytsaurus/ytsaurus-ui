import {GET_LOCKS, IS_PARTIAL} from '../../../../constants/navigation/tabs/locks';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    locks: [],
    isPartial: false,
    modeFilter: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_LOCKS.REQUEST:
            return {...state, loading: true};

        case GET_LOCKS.SUCCESS: {
            const {locks} = action.data;

            return {
                ...state,
                locks,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_LOCKS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_LOCKS.CANCELLED:
            return {...initialState};

        case IS_PARTIAL:
            return {...state, isPartial: action.data.isPartial};

        case GET_LOCKS.PARTITION:
            return {...state, ...action.data};

        default:
            return state;
    }
};
