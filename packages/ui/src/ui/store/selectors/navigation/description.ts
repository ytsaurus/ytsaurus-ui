import {RootState} from '../../../store/reducers';

export const getExternalDescription = (state: RootState) =>
    state.navigation.description.externalDescription;
