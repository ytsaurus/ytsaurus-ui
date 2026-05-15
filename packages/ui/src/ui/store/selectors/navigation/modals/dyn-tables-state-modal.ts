import {type RootState} from '../../../reducers';

export const selectDynTablesStateModalVisible = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.showModal;
export const selectDynTablesStateModalPaths = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.paths;
export const selectDynTablesStateModalAction = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.action;
