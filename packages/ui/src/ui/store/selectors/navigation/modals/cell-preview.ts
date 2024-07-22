import type {RootState} from '../../../reducers';

export const selectCellPreviewVisible = (state: RootState) =>
    state.navigation.modals.cellPreviewModal.visible;
export const selectCellPreviewLoading = (state: RootState) =>
    state.navigation.modals.cellPreviewModal.loading;
export const selectCellPreviewData = (state: RootState) =>
    state.navigation.modals.cellPreviewModal.data;
export const selectCellPreviewCellPath = (state: RootState) =>
    state.navigation.modals.cellPreviewModal.cellPath;
export const selectErrorPreviewCellPath = (state: RootState) =>
    state.navigation.modals.cellPreviewModal.error;
