import {ABORT_TRANSACTION} from '../../../../constants/navigation/content/transaction';

export const initialState = {
    loading: false,
    error: false,
    errorData: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ABORT_TRANSACTION.REQUEST:
            return {...state, loading: true};

        case ABORT_TRANSACTION.SUCCESS:
            return {...state, loading: false, error: false};

        case ABORT_TRANSACTION.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case ABORT_TRANSACTION.CANCELLED:
            return {...state, ...initialState};

        default:
            return state;
    }
};
