import {type RootState} from '../../../store/reducers';

export const selectCurrentUserName = (state: RootState): string => state?.global?.login;
