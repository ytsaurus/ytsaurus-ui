import {GET_DOCUMENT} from '../../../../constants/navigation/content/document';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    document: null,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_DOCUMENT.REQUEST:
            return {...state, loading: true};

        case GET_DOCUMENT.SUCCESS: {
            const {document} = action.data;

            return {
                ...state,
                document,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_DOCUMENT.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_DOCUMENT.CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};
