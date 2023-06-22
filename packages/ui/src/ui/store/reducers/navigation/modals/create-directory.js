import {
    CLOSE_CREATE_DIRECTORY_POPUP,
    CREATE_DIRECTORY,
    OPEN_CREATE_DIRECTORY_POPUP,
} from '../../../../constants/navigation/modals/create-directory';
import {
    HIDE_ERROR,
    SET_PATH,
    SHOW_ERROR,
} from '../../../../constants/navigation/modals/path-editing-popup';

const initialState = {
    popupVisible: false,
    showError: false,
    creating: false,
    errorMessage: '',
    error: {},
    creatingPath: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CREATE_DIRECTORY.REQUEST:
            return {...state, creating: true};

        case CREATE_DIRECTORY.SUCCESS:
            return {...state, creating: false, popupVisible: false};

        case CREATE_DIRECTORY.FAILURE:
            return {...state, creating: false};

        case CREATE_DIRECTORY.CANCELLED:
            return {
                ...state,
                creating: false,
                showError: false,
                errorMessage: '',
                error: {},
            };

        case SET_PATH:
            return {...state, creatingPath: action.data.newPath};

        case OPEN_CREATE_DIRECTORY_POPUP:
            return {
                ...state,
                popupVisible: true,
                creatingPath: action.data.path,
            };

        case CLOSE_CREATE_DIRECTORY_POPUP:
            return {
                ...state,
                creatingPath: '',
                suggestions: [],
                popupVisible: false,
                showError: false,
            };

        case SHOW_ERROR:
            return {
                ...state,
                showError: true,
                errorMessage: action.data.message,
                error: action.data.error,
            };

        case HIDE_ERROR:
            return {
                ...state,
                showError: false,
                errorMessage: '',
                error: {},
            };

        default:
            return state;
    }
};
