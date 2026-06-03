import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';

export const selectShowAiChat = createSelector([selectSettingsData], (data) => {
    return data['global::development::showAiChat'];
});

export const shouldUseYqlTypes = createSelector([selectSettingsData], (data) => {
    return data['global::development::yqlTypes'];
});
