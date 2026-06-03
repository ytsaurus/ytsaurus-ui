import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';

export const getVcsType = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:type'] || '';
});

export const getVcsRepository = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:repository'] || '';
});

export const getVcsBranch = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:branch'] || '';
});

export const getVcsPath = createSelector(selectSettingsData, (data) => {
    return data['global::vcs:path'] || '';
});
