import {
    CLOSE_ATTRIBUTES_MODAL,
    LOAD_ATTRIBUTES,
    OPEN_ATTRIBUTES_MODAL,
} from '../../../constants/modals/attributes-modal';

const initialState = {
    loading: false,
    loaded: false,
    error: false,
    visible: false,
    title: '',
    attributes: {},
    errorData: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_ATTRIBUTES_MODAL: {
            const {title} = action.data;

            return {...state, title, visible: true};
        }

        case CLOSE_ATTRIBUTES_MODAL:
            return {...initialState};

        case LOAD_ATTRIBUTES.REQUEST:
            return {...state, loading: true};

        case LOAD_ATTRIBUTES.SUCCESS: {
            const {attributes} = action.data;

            return {...state, attributes, loading: false, loaded: true};
        }

        case LOAD_ATTRIBUTES.FAILURE: {
            const {error} = action.data;

            return {
                ...state,
                errorData: error,
                loading: false,
                loaded: false,
                error: true,
            };
        }

        default:
            return state;
    }
};
