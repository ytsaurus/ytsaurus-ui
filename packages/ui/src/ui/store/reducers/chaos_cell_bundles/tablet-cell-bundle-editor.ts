import {Action} from 'redux';

import type {ActionD, YTError} from '../../../types';
import {
    CHAOS_BUNDLES_EDITOR_LOAD_FAILURE,
    CHAOS_BUNDLES_EDITOR_LOAD_REQUREST,
    CHAOS_BUNDLES_EDITOR_LOAD_SUCCESS,
    CHAOS_BUNDLES_EDITOR_PARTIAL,
} from '../../../constants/tablets';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

export interface ChaosCellBundleEditorState {
    loading: boolean;
    loaded: boolean;
    error?: YTError;
    bundleName?: string;

    data: object;

    visibleEditor: boolean;
}

const initialState: ChaosCellBundleEditorState = {
    loading: false,
    loaded: false,

    data: {},

    visibleEditor: false,
};

function reducer(
    state = initialState,
    action: ChaosCellBundleEditorAction,
): ChaosCellBundleEditorState {
    switch (action.type) {
        case CHAOS_BUNDLES_EDITOR_LOAD_REQUREST:
            return {...state, loading: true};
        case CHAOS_BUNDLES_EDITOR_LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.data,
            };
        case CHAOS_BUNDLES_EDITOR_LOAD_SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
        case CHAOS_BUNDLES_EDITOR_PARTIAL:
            return {...state, ...action.data};
    }
}

export type ChaosCellBundleEditorAction =
    | Action<typeof CHAOS_BUNDLES_EDITOR_LOAD_REQUREST>
    | ActionD<typeof CHAOS_BUNDLES_EDITOR_LOAD_FAILURE, YTError>
    | ActionD<typeof CHAOS_BUNDLES_EDITOR_LOAD_SUCCESS, ChaosCellBundleEditorState['data']>
    | ActionD<
          typeof CHAOS_BUNDLES_EDITOR_PARTIAL,
          Omit<Partial<ChaosCellBundleEditorState>, 'loading' | 'loaded' | 'error'>
      >;

const chaos_cell_bundles = mergeStateOnClusterChange(initialState, {}, reducer);

export default chaos_cell_bundles;
