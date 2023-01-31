import {
    RESTORE_OBJECT,
    OPEN_RESTORE_POPUP,
    CLOSE_RESTORE_POPUP,
} from '../../../../constants/navigation/modals/restore-object';
import {
    SHOW_ERROR,
    HIDE_ERROR,
    SET_PATH,
} from '../../../../constants/navigation/modals/path-editing-popup';

const initialState = {
    restoredPath: '',
    objectPath: '',
    showError: false,
    errorMessage: '',
    error: {},
    popupVisible: false,
    restoring: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RESTORE_OBJECT.REQUEST:
            return {...state, restoring: true};

        case RESTORE_OBJECT.SUCCESS:
            return {...state, restoring: false, popupVisible: false};

        case RESTORE_OBJECT.FAILURE:
            return {...state, restoring: false};

        case SET_PATH:
            return {...state, restoredPath: action.data.newPath};

        case OPEN_RESTORE_POPUP: {
            const {path, objectPath} = action.data;

            return {
                ...state,
                popupVisible: true,
                restoredPath: path,
                objectPath,
            };
        }

        case CLOSE_RESTORE_POPUP:
            return {
                ...state,
                path: '',
                objectPath: '',
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
