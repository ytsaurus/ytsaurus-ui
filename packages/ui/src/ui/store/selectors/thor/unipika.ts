import {createSelector} from 'reselect';
import clone_ from 'lodash/clone';

import {
    selectFormat,
    selectShouldCompact,
    selectShouldEscapeWhitespace,
    selectShowDecoded,
    selectUseBinaryAsHex,
} from '../../../store/selectors/settings';
import {getUnipikaSettingsFromConfig} from '../../../common/thor/unipika-settings';

export interface YsonSettings {
    format: string;
    showDecoded: boolean;
    compact: boolean;
    escapeWhitespace: boolean;
    binaryAsHex: boolean;
    asHTML: boolean;
}

/**
 * !!! Do not use this selector directly, result should be copied by another selector !!!
 * unipika.format && unipika.foramtRaw mix different properties into settings-object.
 * So, to minimize side-effects each UI-component should use his-own copy of settings-object.
 */
const selectYsonSettings = createSelector(
    [
        selectFormat,
        selectShowDecoded,
        selectShouldCompact,
        selectShouldEscapeWhitespace,
        selectUseBinaryAsHex,
    ],
    (
        format: string,
        showDecoded: boolean,
        compact: boolean,
        escapeWhitespace: boolean,
        binaryAsHex: boolean,
    ): YsonSettings => {
        return {
            format,
            showDecoded,
            compact,
            escapeWhitespace,
            binaryAsHex,
            asHTML: true,
            ...getUnipikaSettingsFromConfig(),
        };
    },
);

export const selectJobGeneralYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectJobSpecificationYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectTableYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectOperationAttributesYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectOperationExperimentsYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectNavigationMountConfigYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectEditJsonYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectNodeUnrecognizedOptionsYsonSettings = createSelector(
    [selectYsonSettings],
    clone_,
);

export const selectPreviewCellYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectFlowSpecYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectErrorsYsonSettings = createSelector([selectYsonSettings], clone_);

export const selectYsonSettingsDisableDecode = createSelector([selectYsonSettings], (settings) => {
    return {...settings, decodeUTF8: false};
});

export const selectYsonSettingsErrorDetails = createSelector([selectYsonSettings], clone_);
