import type {RootState} from '../../../store/reducers';

export const getTabletCellBundleEditorState = (state: RootState) => state.tabletCellBundleEditor;
export const getTabletCellBundleControllerInstanceDetailsMap = (state: RootState) =>
    state.tabletCellBundleEditor.instanceDetailsMap;
