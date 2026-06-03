import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';

export const selectVcsType = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:type'] || '';
});

export const selectVcsRepository = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:repository'] || '';
});

export const selectVcsBranch = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:branch'] || '';
});

export const selectVcsPath = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:path'] || '';
});
