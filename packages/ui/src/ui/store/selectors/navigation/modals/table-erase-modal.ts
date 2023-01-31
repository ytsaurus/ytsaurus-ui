import {RootState} from '../../../../store/reducers';

export const getNavigationTableEraseModalVisible = (state: RootState) =>
    state.navigation.modals.tableEraseModal.visible;
export const getNavigationTableEraseModalPath = (state: RootState) =>
    state.navigation.modals.tableEraseModal.path;
