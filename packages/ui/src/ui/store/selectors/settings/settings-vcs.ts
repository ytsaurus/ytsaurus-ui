import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';

export const getVcsType = createSelector(getSettingsData, (data) => {
    return data['global::vcs:type'] || '';
});

export const getVcsRepository = createSelector(getSettingsData, (data) => {
    return data['global::vcs:repository'] || '';
});

export const getVcsBranch = createSelector(getSettingsData, (data) => {
    return data['global::vcs:branch'] || '';
});

export const getVcsPath = createSelector(getSettingsData, (data) => {
    return data['global::vcs:path'] || '';
});
