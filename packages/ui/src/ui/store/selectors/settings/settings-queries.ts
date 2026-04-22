import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';
import {selectQueryDraft} from '../query-tracker/query';

export const getQuerySuggestionsEnabled = createSelector(getSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});

export const getLastUserChoiceQueryEngine = createSelector([getSettingsData], (data) => {
    return data[`global::queryTracker::lastEngine`];
});

export const getLastUserChoiceQueryDiscoveryPath = createSelector(
    [getSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastDiscoveryPath`];
    },
);

export const getLastUserChoiceQueryChytClique = createSelector(
    [getSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastChytClique`];
    },
);

export const getLastUserChoiceYqlVersion = createSelector(
    [getSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastYqlVersion`];
    },
);

export const getQueryTokens = createSelector([getSettingsData], (data) => {
    return data['global::queryTracker::tokens'] || [];
});
