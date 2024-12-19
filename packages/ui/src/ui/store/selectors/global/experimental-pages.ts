import {createSelector} from 'reselect';

import {Page} from '../../../../shared/constants/settings';

import UIFactory from '../../../UIFactory';
import {RootState} from '../../../store/reducers';
import {isDeveloper} from '../../../store/selectors/global/is-developer';

export const getAllowedExperimentalPages = (state: RootState) =>
    state?.global.allowedExperimentalPages;

export const isQueryTrackerAllowed = createSelector(
    [isDeveloper, getAllowedExperimentalPages],
    (isDeveloper, allowedPages = []) => {
        const expPages = UIFactory.getExperimentalPages();
        return (
            isDeveloper || !expPages.includes(Page.QUERIES) || allowedPages.includes(Page.QUERIES)
        );
    },
);

export const isExperimentalPagesReady = (state: RootState) => {
    return (
        UIFactory.getExperimentalPages().length == 0 ||
        getAllowedExperimentalPages(state) !== undefined
    );
};
