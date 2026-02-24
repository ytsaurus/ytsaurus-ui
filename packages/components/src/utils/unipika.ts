import extend_ from 'lodash/extend';
// @ts-ignore
import unipikaLib from '@gravity-ui/unipika/lib/unipika';

export type UnipikaSettings = {
    nonBreakingIndent?: boolean;
    escapeWhitespace?: boolean;
    escapeYQLStrings?: boolean;
    binaryAsHex?: boolean;
    showDecoded?: boolean;
    decodeUTF8?: boolean;
    format?: string;
    indent?: number;
    compact?: boolean;
    asHTML?: boolean;
    break?: boolean;
    maxListSize?: number;
    maxStringSize?: number;
    omitStructNull?: boolean;
    treatValAsData?: boolean;

    validateSrcUrl?: (taggedTypeUrl: string) => boolean;
    normalizeUrl?: (url?: string) => string;
};

const unipika = extend_({}, unipikaLib);
const {utf8} = unipika.utils;

/**
 * Applies default settings for standalone usage (no Redux/store).
 * In the main app, prepareSettings merges with store; here we only set defaults.
 */
function prepareSettings(settings: UnipikaSettings = {}): UnipikaSettings {
    return {
        asHTML: true,
        ...settings,
    };
}

unipika.prepareSettings = prepareSettings;

function prettyPrint(value: unknown, settings: UnipikaSettings) {
    const content =
        settings.format === 'raw-json'
            ? unipika.formatRaw(value, settings)
            : unipika.formatFromYSON(value, settings);

    return settings.asHTML ? '<pre class="unipika">' + content + '</pre>' : content;
}

/**
 * @deprecated The function uses store implicitly, use `prettyPrint` from `utils/unipika.ts instead of it.
 */
unipika.prettyprint = function (value: unknown, settings: UnipikaSettings) {
    settings = unipika.prepareSettings(settings);
    return prettyPrint(value, settings);
};

unipika.decode = function (str: string, showDecoded = true): string {
    return showDecoded ? utf8.decode(str) : str;
};

unipika.unescapeKeyValue = unipika.utils.format.unescapeKeyValue;

export default unipika;
