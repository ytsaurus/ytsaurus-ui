import {RootState} from '../../../reducers';

export const getDynTablesStateModalVisible = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.showModal;
export const getDynTablesStateModalPaths = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.paths;
export const getDynTablesStateModalAction = (state: RootState) =>
    state.navigation.modals.dynTablesStateModal.action;
