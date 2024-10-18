import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CHANGE_PARAMETERS,
    COMMAND,
    LOAD_DATA,
    TOGGLE_PARAMETERS,
} from '../../../constants/path-viewer';

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    data: undefined, // array or object
};

const persistedState = {
    path: '/',
    attributes: '',
    command: COMMAND.LIST,
    maxSize: '',

    encodeUTF8: false,
    stringify: false,
    annotateWithTypes: false,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_DATA.REQUEST:
            return {...state, loading: true};

        case LOAD_DATA.SUCCESS: {
            const {data} = action.data;

            return {
                ...state,
                data,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_DATA.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_DATA.CANCELLED:
            return {...initialState};

        case CHANGE_PARAMETERS: {
            const {param, value} = action.data;

            return {...state, [param]: value};
        }

        case TOGGLE_PARAMETERS: {
            const {param} = action.data;

            return {...state, [param]: !state[param]};
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
