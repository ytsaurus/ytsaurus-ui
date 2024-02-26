import {GET_ANNOTATION} from '../../../../constants/navigation/tabs/annotation';
import {FETCH_NODES} from '../../../../constants/navigation';

export const initialState = {
    loading: false,
    loaded: false,
    error: {},
    annotation: null,
    path: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_ANNOTATION.REQUEST:
            return {...state, loading: true};
        case GET_ANNOTATION.SUCCESS:
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: undefined,
            };
        case GET_ANNOTATION.FAILURE:
            return {...state, ...action.data, loading: false};
        case FETCH_NODES.CANCELLED:
            return {...initialState};
        default:
            return state;
    }
};
