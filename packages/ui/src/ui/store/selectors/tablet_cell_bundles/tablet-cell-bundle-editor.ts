import {type RootState} from '../../../store/reducers';

export const selectTabletCellBundleEditorState = (state: RootState) => state.tabletCellBundleEditor;
export const selectTabletCellBundleControllerInstanceDetailsMap = (state: RootState) =>
    state.tabletCellBundleEditor.instanceDetailsMap;
