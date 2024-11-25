import {createSelector} from 'reselect';

import {uiSettings} from '../../../config/ui-settings';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

const getSettingSelectedFontType = createSelector(getSettingsData, (data) => {
    return data['global::fontType'];
});

export const getFontType = createSelector(
    [getSettingSelectedFontType],
    (selectedFontType: string) => {
        const {defaultFontType = ''} = uiSettings;
        return selectedFontType && selectedFontType !== 'auto' ? selectedFontType : defaultFontType;
    },
);

export const getFontFamilies = createSelector(getFontType, (fontType) => {
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
