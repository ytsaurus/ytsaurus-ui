import {
    SET_ANNOTATION,
    SET_ANNOTATION_EDITING,
    SET_ANNOTATION_SAVING,
} from '../../../../constants/navigation/tabs/annotation';
import {ActionD} from '../../../../types';

type NavigationTabsAnnotationState = {
    saving: boolean;
    editing: boolean;
    annotation: string | null;
};

export const initialState: NavigationTabsAnnotationState = {
    saving: false,
    editing: false,
    annotation: null,
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
        default:
            return state;
    }
};

export type NavigationTabsAnnotationAction =
    | ActionD<typeof SET_ANNOTATION, string>
    | ActionD<typeof SET_ANNOTATION_SAVING, boolean>
    | ActionD<typeof SET_ANNOTATION_EDITING, boolean>;
