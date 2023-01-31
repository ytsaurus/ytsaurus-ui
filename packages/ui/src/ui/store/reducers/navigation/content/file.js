import {LOAD_FILE} from '../../../../constants/navigation/content/file';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    file: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOAD_FILE.REQUEST:
            return {...state, loading: true};

        case LOAD_FILE.SUCCESS: {
            const {file} = action.data;

            return {
                ...state,
                file,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_FILE.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_FILE.CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};
