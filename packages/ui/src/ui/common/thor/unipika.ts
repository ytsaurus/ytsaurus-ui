import extend_ from 'lodash/extend';
// @ts-ignore
import unipikaLib from '@gravity-ui/unipika/lib/unipika';
import hammer from '../hammer';
import {getSettingBySelector} from '../utils/redux';
import {
    getFormat,
    shouldCompact,
    shouldEscapeWhitespace,
    shouldShowDecoded,
    useBinaryAsHex,
} from '../../store/selectors/settings';
import type {UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {getUnipikaSettingsFromConfig} from './unipika-settings';

const parseSetting = hammer.utils.parseSetting;

const unipika = extend_({}, unipikaLib);
const {utf8} = unipika.utils;

unipika.prepareSettings = function (settings: UnipikaSettings) {
    settings = settings || {};
    Object.assign(settings, getUnipikaSettingsFromConfig());

    settings.format = parseSetting(settings, 'format', getSettingBySelector(getFormat));
    settings.showDecoded = parseSetting(
        settings,
        'showDecoded',
        getSettingBySelector(shouldShowDecoded),
    );
    settings.compact = parseSetting(settings, 'compact', getSettingBySelector(shouldCompact));
    settings.escapeWhitespace = parseSetting(
        settings,
        'escapeWhitespace',
        getSettingBySelector(shouldEscapeWhitespace),
    );
    settings.binaryAsHex = parseSetting(
        settings,
        'binaryAsHex',
        getSettingBySelector(useBinaryAsHex),
    );

    settings.asHTML = parseSetting(settings, 'asHTML', true);

    return settings;
};

unipika.prettyprint = function (value: unknown, settings: UnipikaSettings) {
    settings = unipika.prepareSettings(settings);

    function _prettyprint(value: unknown, settings: UnipikaSettings) {
        return settings.format === 'raw-json'
            ? unipika.formatRaw(value, settings)
            : unipika.formatFromYSON(value, settings);
    }

    return settings.asHTML
        ? '<pre class="unipika">' + _prettyprint(value, settings) + '</pre>'
        : _prettyprint(value, settings);
};

unipika.decode = function (str: string) {
    const showDecoded = getSettingBySelector(shouldShowDecoded);
    return showDecoded ? utf8.decode(str) : str;
};

unipika.unescapeKeyValue = unipika.utils.format.unescapeKeyValue;

export default unipika;
