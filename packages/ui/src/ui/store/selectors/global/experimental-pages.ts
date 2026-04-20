import UIFactory from '../../../UIFactory';
import {type RootState} from '../../../store/reducers';

export const selectAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;

export const selectIsExperimentalPagesReady = (state: RootState) => {
    return (
        UIFactory.getExperimentalPages().length == 0 ||
        selectAllowedExperimentalPages(state) !== undefined
    );
};
