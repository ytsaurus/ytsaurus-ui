import type {ActionD, YTError} from '../../../types';
import {
    TABLETS_BUNDLES_EDITOR_LOAD_FAILURE,
    TABLETS_BUNDLES_EDITOR_LOAD_REQUREST,
    TABLETS_BUNDLES_EDITOR_LOAD_SUCCESS,
    TABLETS_BUNDLES_EDITOR_PARTIAL,
} from '../../../constants/tablets';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {OrchidBundlesData, TabletBundle} from '.';

export interface TabletCellBundleEditorState {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;
    bundleName: string | undefined;

    data: object;
    bundleData: TabletBundle | undefined;
    bundleControllerData: OrchidBundlesData | undefined;

    instanceDetailsMap: Record<string, BundleControllerInstanceDetails>;

    visibleEditor: boolean;
}

export interface BundleControllerInstanceDetails {
    nanny_service?: string;
    tablet_static_memory?: {used?: number; limit?: number};
}

const initialState: TabletCellBundleEditorState = {
    loading: false,
    loaded: false,
    error: undefined,

    data: {},
    bundleData: undefined,
    bundleControllerData: undefined,
    bundleName: undefined,

    instanceDetailsMap: {},

    visibleEditor: false,
};

function reducer(
    state = initialState,
    action: TabletCellBundleEditorAction,
): TabletCellBundleEditorState {
    switch (action.type) {
        case TABLETS_BUNDLES_EDITOR_LOAD_REQUREST: {
            const {bundleName} = action.data;
            const s = !state.bundleName || state.bundleName === bundleName ? state : initialState;
            return {...s, ...action.data, loading: true};
        }
        case TABLETS_BUNDLES_EDITOR_LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.data,
            };
        case TABLETS_BUNDLES_EDITOR_LOAD_SUCCESS:
            return {...state, ...action.data, loading: false, loaded: true};
        case TABLETS_BUNDLES_EDITOR_PARTIAL:
            return {...state, ...action.data};
    }
}

export type TabletCellBundleEditorAction =
    | ActionD<
          typeof TABLETS_BUNDLES_EDITOR_LOAD_REQUREST,
          Pick<TabletCellBundleEditorState, 'bundleName'>
      >
    | ActionD<typeof TABLETS_BUNDLES_EDITOR_LOAD_FAILURE, YTError>
    | ActionD<
          typeof TABLETS_BUNDLES_EDITOR_LOAD_SUCCESS,
          Pick<TabletCellBundleEditorState, 'bundleData'>
      >
    | ActionD<
          typeof TABLETS_BUNDLES_EDITOR_PARTIAL,
          Omit<Partial<TabletCellBundleEditorState>, 'loading' | 'loaded' | 'error'>
      >;

const tablet_cell_bundles = mergeStateOnClusterChange(initialState, {}, reducer);

export default tablet_cell_bundles;
