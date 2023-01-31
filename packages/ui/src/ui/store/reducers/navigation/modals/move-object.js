import {
    MOVE_OBJECT,
    OPEN_MOVE_OBJECT_POPUP,
    CLOSE_MOVE_OBJECT_POPUP,
} from '../../../../constants/navigation/modals/move-object';
import {
    SET_PATH,
    SHOW_ERROR,
    HIDE_ERROR,
} from '../../../../constants/navigation/modals/path-editing-popup';

const initialState = {
    popupVisible: false,
    showError: false,
    renaming: false,
    multipleMode: false,
    items: [],
    errorMessage: '',
    error: {},
    movedPath: '',
    objectPath: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case MOVE_OBJECT.REQUEST:
            return {...state, renaming: true};

        case MOVE_OBJECT.SUCCESS:
            return {...state, renaming: false, popupVisible: false};

        case MOVE_OBJECT.FAILURE:
            return {...state, renaming: false};

        case MOVE_OBJECT.CANCELLED:
            return {
                ...state,
                creating: false,
                renaming: false,
                errorMessage: '',
                error: {},
            };

        case SET_PATH:
            return {...state, movedPath: action.data.newPath};

        case OPEN_MOVE_OBJECT_POPUP: {
            const {path, objectPath, multipleMode, items} = action.data;

            return {
                ...state,
                items,
                multipleMode,
                movedPath: path,
                popupVisible: true,
                objectPath: objectPath,
            };
        }

        case CLOSE_MOVE_OBJECT_POPUP:
            return {
                ...state,
                movedPath: '',
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
