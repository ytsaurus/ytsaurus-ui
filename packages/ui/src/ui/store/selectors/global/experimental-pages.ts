import {RootState} from '../../../store/reducers';

export const getAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;
