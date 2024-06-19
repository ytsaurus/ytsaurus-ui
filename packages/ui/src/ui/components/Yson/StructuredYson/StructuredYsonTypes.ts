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

interface BaseUnipikaValue {
    $attributes?: UnipikaMap['$value'];
}

export type UnipikaValue = UnipikaMap | UnipikaList | UnipikaString | UnipikaPrimitive;

export interface UnipikaMap extends BaseUnipikaValue {
    $type: 'map';
    $value: Array<[UnipikaMapKey, UnipikaValue]>;
}

interface UnipikaType<Type, Value> extends BaseUnipikaValue {
    $type: Type;
    $value: Value;
}

export interface UnipikaMapKey extends BaseUnipikaValue {
    $key: true;
    $type: 'string';
    $value: string;
    $decoded_value?: string;
}

export interface UnipikaList extends BaseUnipikaValue {
    $type: 'list';
    $value: Array<UnipikaValue>;
}

export type UnipikaString = UnipikaType<'string', string> & {
    $decoded_value?: string;
};

/**
 * Actually there might be another primitive types but at this level
 * it is enought to know that there are specific interfaces for 'map', 'list' and 'string',
 * and similar structure for all rest types.
 */
export type UnipikaPrimitive = UnipikaType<
    'null' | 'boolean' | 'number' | 'double' | 'int64',
    string | number | boolean | null
>;
