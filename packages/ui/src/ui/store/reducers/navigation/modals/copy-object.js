import {
    CLOSE_COPY_OBJECT_POPUP,
    COPY_OBJECT,
    OPEN_COPY_OBJECT_POPUP,
} from '../../../../constants/navigation/modals/copy-object';
import {
    HIDE_ERROR,
    SET_PATH,
    SHOW_ERROR,
} from '../../../../constants/navigation/modals/path-editing-popup';

const initialState = {
    copyPath: '',
    objectPath: '',
    showError: false,
    errorMessage: '',
    error: {},
    popupVisible: false,
    copying: false,
    multipleMode: false,
    items: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case COPY_OBJECT.REQUEST:
            return {...state, copying: true};

        case COPY_OBJECT.SUCCESS:
            return {...state, copying: false, popupVisible: false};

        case COPY_OBJECT.FAILURE:
            return {...state, copying: false};

        case COPY_OBJECT.CANCELLED:
            return {
                ...state,
                copying: false,
                showError: false,
                errorMessage: '',
                error: {},
            };

        case SET_PATH:
            return {...state, copyPath: action.data.newPath};

        case OPEN_COPY_OBJECT_POPUP: {
            const {path, objectPath, multipleMode, items} = action.data;

            return {
                ...state,
                items,
                objectPath,
                multipleMode,
                popupVisible: true,
                copyPath: path,
            };
        }

        case CLOSE_COPY_OBJECT_POPUP:
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
