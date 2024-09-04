import {RootState} from '../../../store/reducers';

export const getCurrentUserName = (state: RootState): string => state?.global?.login;
