import {
    GET_DOCUMENT,
    SET_DOCUMENT_EDIT_MODE,
} from '../../../../constants/navigation/content/document';
import {Action} from 'redux';
import {ActionD} from '../../../../types';

export type NavigationDocumentState = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: any;
    document: any;
    editMode: boolean;
};

export const initialState: NavigationDocumentState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    document: null,
    editMode: false,
};

export default (state = initialState, action: NavigationDocumentAction) => {
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
        case SET_DOCUMENT_EDIT_MODE:
            return {...state, editMode: action.data};
        default:
            return state;
    }
};

export type NavigationDocumentAction =
    | Action<typeof GET_DOCUMENT.CANCELLED>
    | Action<typeof GET_DOCUMENT.REQUEST>
    | ActionD<typeof GET_DOCUMENT.SUCCESS, any>
    | ActionD<typeof GET_DOCUMENT.FAILURE, any>
    | ActionD<typeof SET_DOCUMENT_EDIT_MODE, boolean>;
