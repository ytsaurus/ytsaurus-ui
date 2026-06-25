import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';
import {selectQueryDraft} from '../query-tracker/query';

export const selectQuerySuggestionsEnabled = createSelector(selectSettingsData, (data) => {
    return data['global::queryTracker::suggestions'] || false;
});

export const selectLastUserChoiceQueryEngine = createSelector([selectSettingsData], (data) => {
    return data[`global::queryTracker::lastEngine`];
});

export const selectLastUserChoiceQueryDiscoveryPath = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastDiscoveryPath`];
    },
);

export const selectLastUserChoiceQueryChytClique = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastChytClique`];
    },
);

export const selectLastUserChoiceYqlVersion = createSelector(
    [selectSettingsData, selectQueryDraft],
    (data, {settings}) => {
        return data[`local::${settings?.cluster}::queryTracker::lastYqlVersion`];
    },
);
export const selectQueryTokens = createSelector([selectSettingsData], (data) => {
    return data['global::queryTracker::tokens'] || [];
});
