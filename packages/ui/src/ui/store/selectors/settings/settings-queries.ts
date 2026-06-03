import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';
import {selectQueryDraft} from '../query-tracker/query';

export const getQuerySuggestionsEnabled = createSelector(selectSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});

export const getLastUserChoiceQueryEngine = createSelector([selectSettingsData], (data) => {
    return data[`global::queryTracker::lastEngine`];
});

export const getLastUserChoiceQueryDiscoveryPath = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastDiscoveryPath`];
    },
);

export const getLastUserChoiceQueryChytClique = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastChytClique`];
    },
);

export const getLastUserChoiceYqlVersion = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastYqlVersion`];
    },
);

export const getQueryTokens = createSelector([selectSettingsData], (data) => {
    return data['global::queryTracker::tokens'] || [];
});
