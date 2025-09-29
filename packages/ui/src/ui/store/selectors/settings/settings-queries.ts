import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';
import {getQueryDraft} from '../query-tracker/query';

export const getQuerySuggestionsEnabled = createSelector(getSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});

export const getLastUserChoiceQueryEngine = createSelector([getSettingsData], (data) => {
    return data[`global::queryTracker::lastEngine`];
});

export const getLastUserChoiceQueryDiscoveryPath = createSelector(
    [getSettingsData, getQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastDiscoveryPath`];
    },
);

export const getLastUserChoiceQueryChytClique = createSelector(
    [getSettingsData, getQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastChytClique`];
    },
);

export const getLastUserChoiceYqlVersion = createSelector(
    [getSettingsData, getQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastYqlVersion`];
    },
);

export const getQueryTokens = createSelector([getSettingsData], (data) => {
    return data['global::queryTracker::tokens'] || [];
});
