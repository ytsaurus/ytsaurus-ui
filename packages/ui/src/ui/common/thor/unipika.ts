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
    settings = settings || {};
    Object.assign(settings, getUnipikaSettingsFromConfig());

    settings.format = parseSetting(settings, 'format', getSettingBySelector(selectFormat));
    settings.showDecoded = parseSetting(
        settings,
        'showDecoded',
        getSettingBySelector(selectShouldShowDecoded),
    );
    settings.compact = parseSetting(settings, 'compact', getSettingBySelector(selectShouldCompact));
    settings.escapeWhitespace = parseSetting(
        settings,
        'escapeWhitespace',
        getSettingBySelector(selectShouldEscapeWhitespace),
    );
    settings.binaryAsHex = parseSetting(
        settings,
        'binaryAsHex',
        getSettingBySelector(selectUseBinaryAsHex),
    );

    settings.asHTML = parseSetting(settings, 'asHTML', true);

    return settings;
};

/**
 * @deprecated The function uses store implicitly, use `prettyPrint` from `utils/unipika.ts instead of it.
 */
unipika.prettyprint = function (value: unknown, settings: UnipikaSettings) {
    settings = unipika.prepareSettings(settings);
    return prettyPrint(value, settings);
};

unipika.decode = function (str: string) {
    const showDecoded = getSettingBySelector(selectShouldShowDecoded);
    return showDecoded ? utf8.decode(str) : str;
};

unipika.unescapeKeyValue = unipika.utils.format.unescapeKeyValue;

export default unipika;
