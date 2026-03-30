import {createSelector} from 'reselect';

import {uiSettings} from '../../../config/ui-settings';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

const selectSettingSelectedFontType = createSelector(getSettingsData, (data) => {
    return data['global::fontType'];
});

export const selectFontType = createSelector(
    [selectSettingSelectedFontType],
    (selectedFontType: string) => {
        const {defaultFontType = ''} = uiSettings;
        return selectedFontType && selectedFontType !== 'auto' ? selectedFontType : defaultFontType;
    },
);

export const selectFontFamilies = createSelector(selectFontType, (fontType) => {
    const {fontTypes} = uiSettings;
    if (fontTypes?.[fontType]) {
        const {regular, monospace} = fontTypes?.[fontType] ?? {};
        if (regular && monospace) {
            return fontTypes[fontType];
        }
        throw new Error(
            `'uiSettings.fontTypes[${fontType}]' must contain non empty fields: regular, monospace`,
        );
    }

    return {regular: 'Manrope', monospace: 'RobotoMono'};
});
