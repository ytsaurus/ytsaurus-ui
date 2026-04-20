import {type RootState} from '../../../store/reducers';

export const selectExternalDescription = (state: RootState) =>
    state.navigation.description.externalDescription;
