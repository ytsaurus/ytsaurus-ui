import {type RootState} from '../../../../store/reducers';

export const selectCreateACOModalState = (state: RootState) => state.navigation.modals.createACOModal;
