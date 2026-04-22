import {createSelector} from 'reselect';
import {getSettingsData} from '../settings/settings-base';

export const selectSettingQueryTrackerQueriesListSidebarVisibilityMode = createSelector(
    getSettingsData,
    (settings) => Boolean(settings['global::queryTracker::queriesListSidebarVisibilityMode']),
);
