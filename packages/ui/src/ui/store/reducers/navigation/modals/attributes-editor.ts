import {ActionD, YTError} from '../../../../types';
import {
    NAVIGATION_ATTRIBUTES_EDITOR_ERROR,
    NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
    NAVIGATION_ATTRIBUTES_EDITOR_REQUEST,
    NAVIGATION_ATTRIBUTES_EDITOR_SUCCESS,
} from '../../../../constants/navigation/modals/attributes-editor';
import {Action} from 'redux';

export interface NavAttrEditorState {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    paths?: Array<string>;
    visible: boolean;

    attributesMap: {[path: string]: object};
}

const initialState: NavAttrEditorState = {
    loading: false,
    loaded: false,
    error: undefined,
    attributesMap: {},

    paths: undefined,
    visible: false,
};

export default function editAttributesReducer(
    state: NavAttrEditorState = initialState,
    action: NavAttrEditorAction,
): NavAttrEditorState {
    switch (action.type) {
        case 'NAVIGATION_ATTRIBUTES_EDITOR_REQUEST':
            return {...state, loading: true};
        case 'NAVIGATION_ATTRIBUTES_EDITOR_SUCCESS':
            return {
                ...state,
                loading: false,
                loaded: true,
                error: undefined,
                ...action.data,
            };
        case 'NAVIGATION_ATTRIBUTES_EDITOR_ERROR':
            return {
                ...state,
                loading: true,
                loaded: false,
                error: action.data,
            };
        case 'NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL':
            return {...state, ...action.data};
    }
    return state;
}

export type NavAttrEditorAction =
    | Action<typeof NAVIGATION_ATTRIBUTES_EDITOR_REQUEST>
    | ActionD<
          typeof NAVIGATION_ATTRIBUTES_EDITOR_SUCCESS,
          Pick<NavAttrEditorState, 'attributesMap'>
      >
    | ActionD<typeof NAVIGATION_ATTRIBUTES_EDITOR_ERROR, NavAttrEditorState['error']>
    | ActionD<
          typeof NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
          Omit<NavAttrEditorState, 'loading' | 'loaded' | 'error' | 'attributesMap'>
      >;
