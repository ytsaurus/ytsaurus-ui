import {createSelector} from 'reselect';
import clone_ from 'lodash/clone';

import {
    getFormat,
    getShowDecoded,
    shouldCompact,
    shouldEscapeWhitespace,
    useBinaryAsHex,
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
const getYsonSettings = createSelector(
    [getFormat, getShowDecoded, shouldCompact, shouldEscapeWhitespace, useBinaryAsHex],
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

export const getJobGeneralYsonSettings = createSelector([getYsonSettings], clone_);

export const getJobSpecificationYsonSettings = createSelector([getYsonSettings], clone_);

export const getTableYsonSettings = createSelector([getYsonSettings], clone_);

export const getOperationAttributesYsonSettings = createSelector([getYsonSettings], clone_);

export const getOperationExperimentsYsonSettings = createSelector([getYsonSettings], clone_);

export const getNavigationMountConfigYsonSettings = createSelector([getYsonSettings], clone_);

export const getEditJsonYsonSettings = createSelector([getYsonSettings], clone_);

export const getNodeUnrecognizedOptionsYsonSettings = createSelector([getYsonSettings], clone_);

export const getPreviewCellYsonSettings = createSelector([getYsonSettings], clone_);
