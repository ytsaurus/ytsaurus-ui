import {RootState} from '../../../../store/reducers';

export const getCreateACOModalState = (state: RootState) => state.navigation.modals.createACOModal;
