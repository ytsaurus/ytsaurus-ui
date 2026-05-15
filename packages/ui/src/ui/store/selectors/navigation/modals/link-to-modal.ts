import {type RootState} from '../../../../store/reducers';

export const selectLinkToModalState = (state: RootState) => state.navigation.modals.linkToModal;
