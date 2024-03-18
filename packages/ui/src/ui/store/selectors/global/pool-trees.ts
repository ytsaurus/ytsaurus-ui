import {RootState} from '../../../store/reducers';

export const getGlobalDefaultPoolTreeName = (state: RootState) => state.global.poolTreeDefault;
