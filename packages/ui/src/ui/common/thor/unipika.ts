import _ from 'lodash';
// @ts-ignore
import unipikaLib from '@gravity-ui/unipika/lib/unipika';
import hammer from '../hammer';
import {getSettingBySelector} from '../utils/redux';
import {
    getFormat,
    shouldShowDecoded,
    shouldCompact,
    shouldEscapeWhitespace,
    useBinaryAsHex,
} from '../../store/selectors/settings';
import {Settings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';

const parseSetting = hammer.utils.parseSetting;

const unipika = _.extend({}, unipikaLib);
const {utf8} = unipika.utils;

unipika.prepareSettings = function (settings: any) {
    settings = settings || {};

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

unipika.prettyprint = function (value: unknown, settings: Settings) {
    settings = unipika.prepareSettings(settings);

    function _prettyprint(value: unknown, settings: Settings) {
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
