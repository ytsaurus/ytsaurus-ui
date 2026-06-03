import {createSelector} from 'reselect';
import {selectSettingsData} from './settings-base';

export const selectShowIncarnationsNext = createSelector([selectSettingsData], (data) => {
    return data['global::operations::showIncarnationsNext'] === true;
});
