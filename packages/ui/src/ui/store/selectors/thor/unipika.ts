import {createSelector} from 'reselect';
import _ from 'lodash';

import {
    getFormat,
    getShowDecoded,
    shouldCompact,
    shouldEscapeWhitespace,
    useBinaryAsHex,
} from '../../../store/selectors/settings';
import {getUnipikaSettingsFromConfig} from '../../../common/thor/unipika-settings';

interface YsonSettings {
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

export const getJobGeneralYsonSettings = createSelector([getYsonSettings], _.clone);

export const getJobSpecificationYsonSettings = createSelector([getYsonSettings], _.clone);

export const getTableYsonSettings = createSelector([getYsonSettings], _.clone);

export const getOperationAttributesYsonSettings = createSelector([getYsonSettings], _.clone);

export const getOperationExperimentsYsonSettings = createSelector([getYsonSettings], _.clone);

export const getNavigationMountConfigYsonSettings = createSelector([getYsonSettings], _.clone);

export const getEditJsonYsonSettings = createSelector([getYsonSettings], _.clone);
