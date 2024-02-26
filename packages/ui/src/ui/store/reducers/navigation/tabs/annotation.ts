import {
    GET_ANNOTATION,
    SET_ANNOTATION,
    SET_ANNOTATION_EDITING,
    SET_ANNOTATION_SAVING,
} from '../../../../constants/navigation/tabs/annotation';
import {Action} from 'redux';
import {ActionD} from '../../../../types';

type NavigationTabsAnnotationState = {
    loading: boolean;
    saving: boolean;
    editing: boolean;
    loaded: boolean;
    error: any;
    annotation: string | null;
    path: string;
};

export const initialState: NavigationTabsAnnotationState = {
    loading: false,
    saving: false,
    editing: false,
    loaded: false,
    error: {},
    annotation: null,
    path: '',
};

export default (
    state: NavigationTabsAnnotationState = initialState,
    action: NavigationTabsAnnotationAction,
) => {
    switch (action.type) {
        case SET_ANNOTATION:
            return {...state, annotation: action.data};
        case SET_ANNOTATION_SAVING:
            return {...state, saving: action.data};
        case SET_ANNOTATION_EDITING:
            return {...state, editing: action.data};
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
        case GET_ANNOTATION.CANCELLED:
            return {...initialState};
        default:
            return state;
    }
};

export type NavigationTabsAnnotationAction =
    | Action<typeof GET_ANNOTATION.REQUEST>
    | Action<typeof GET_ANNOTATION.CANCELLED>
    | ActionD<
          typeof GET_ANNOTATION.SUCCESS,
          Pick<NavigationTabsAnnotationState, 'annotation' | 'path'>
      >
    | ActionD<typeof GET_ANNOTATION.FAILURE, Pick<NavigationTabsAnnotationState, 'error' | 'path'>>
    | ActionD<typeof SET_ANNOTATION, string>
    | ActionD<typeof SET_ANNOTATION_SAVING, boolean>
    | ActionD<typeof SET_ANNOTATION_EDITING, boolean>;
