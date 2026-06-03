import {createSelector} from 'reselect';
import {selectSettingsData} from '../settings/settings-base';

export const selectSettingQueryTrackerQueriesListSidebarVisibilityMode = createSelector(
    selectSettingsData,
    (settings) => Boolean(settings['global::queryTracker::queriesListSidebarVisibilityMode']),
);
