import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';

export const getQuerySuggestionsEnabled = createSelector(getSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});
