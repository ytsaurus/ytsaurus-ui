import {createSelector} from 'reselect';
import {getSettingsData} from './settings-base';

export const selectShowIncarnationsNext = createSelector([getSettingsData], (data) => {
    return data['global::operations::showIncarnationsNext'] === true;
});
