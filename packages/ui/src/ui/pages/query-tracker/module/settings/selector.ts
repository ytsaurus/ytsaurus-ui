import {createSelector} from 'reselect';
import {getSettingsData} from '../../../../store/selectors/settings/settings-base';

export const getSettingQueryTrackerQueriesListSidebarVisibilityMode = createSelector(
    getSettingsData,
    (settings) => Boolean(settings['global::queryTracker::queriesListSidebarVisibilityMode']),
);
