import {type RootState} from '../../../../store/reducers';

export const selectNavigationTableEraseModalVisible = (state: RootState) =>
    state.navigation.modals.tableEraseModal.visible;
export const selectNavigationTableEraseModalPath = (state: RootState) =>
    state.navigation.modals.tableEraseModal.path;
