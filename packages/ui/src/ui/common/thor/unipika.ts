import extend_ from 'lodash/extend';
// @ts-ignore
import unipikaLib from '@gravity-ui/unipika/lib/unipika';
import hammer from '../hammer';
import {getSettingBySelector} from '../utils/redux';
import {
    selectFormat,
    selectShouldCompact,
    selectShouldEscapeWhitespace,
    selectShouldShowDecoded,
    selectUseBinaryAsHex,
} from '../../store/selectors/settings';
import {type UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {prettyPrint} from '../../utils/unipika';

import {getUnipikaSettingsFromConfig} from './unipika-settings';

const parseSetting = hammer.utils.parseSetting;

const unipika = extend_({}, unipikaLib);
const {utf8} = unipika.utils;

/**
 * @deprecated Use corresponding selector from `selectors/thor/unipika`
 */
unipika.prepareSettings = function (settings: UnipikaSettings) {
    const resolvedSettings = settings || {};
    Object.assign(resolvedSettings, getUnipikaSettingsFromConfig());

    resolvedSettings.format = parseSetting(
        resolvedSettings,
        'format',
        getSettingBySelector(selectFormat),
    );
    resolvedSettings.showDecoded = parseSetting(
        resolvedSettings,
        'showDecoded',
        getSettingBySelector(selectShouldShowDecoded),
    );
    resolvedSettings.compact = parseSetting(
        resolvedSettings,
        'compact',
        getSettingBySelector(selectShouldCompact),
    );
    resolvedSettings.escapeWhitespace = parseSetting(
        resolvedSettings,
        'escapeWhitespace',
        getSettingBySelector(selectShouldEscapeWhitespace),
    );
    resolvedSettings.binaryAsHex = parseSetting(
        resolvedSettings,
        'binaryAsHex',
        getSettingBySelector(selectUseBinaryAsHex),
    );

    resolvedSettings.asHTML = parseSetting(resolvedSettings, 'asHTML', true);

    return resolvedSettings;
};

/**
 * @deprecated The function uses store implicitly, use `prettyPrint` from `utils/unipika.ts instead of it.
 */
unipika.prettyprint = function (value: unknown, settings: UnipikaSettings) {
    return prettyPrint(value, unipika.prepareSettings(settings));
};

unipika.decode = function (str: string) {
    const showDecoded = getSettingBySelector(selectShouldShowDecoded);
    return showDecoded ? utf8.decode(str) : str;
};

unipika.unescapeKeyValue = unipika.utils.format.unescapeKeyValue;

export default unipika;
