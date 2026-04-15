import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';

export const selectShowAiChat = createSelector([getSettingsData], (data) => {
    return data['global::development::showAiChat'];
});

export const shouldUseYqlTypes = createSelector([getSettingsData], (data) => {
    return data['global::development::yqlTypes'];
});
