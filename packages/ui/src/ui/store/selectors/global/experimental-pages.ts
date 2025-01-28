import UIFactory from '../../../UIFactory';
import {RootState} from '../../../store/reducers';

export const getAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;

export const isExperimentalPagesReady = (state: RootState) => {
    return (
        UIFactory.getExperimentalPages().length == 0 ||
        getAllowedExperimentalPages(state) !== undefined
    );
};
