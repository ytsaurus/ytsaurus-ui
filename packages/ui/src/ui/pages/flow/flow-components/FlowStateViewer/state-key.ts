import type {FlowStateAccessValidationError, FlowStateValidationError} from './types';

import type {FlowAnnotatedInteger, FlowKeyColumn} from '../../../../../shared/yt-types';
import {
    BIG_INTEGER_RANGES,
    FINITE_NUMBER_PATTERN,
    INTEGER_RANGES,
    SIGNED_INTEGER_PATTERN,
    UNSIGNED_INTEGER_PATTERN,
    getScalarKind,
    isBigIntegerType,
} from '../../../../store/api/yt/flow/state-scalar-types';
import {getOwnProperty} from './state-schema';
import {YSON_AS_TEXT, prettyPrint} from '../../../../utils/unipika';

function castIntegerKey(
    column: FlowKeyColumn,
    trimmed: string,
): {value: number | FlowAnnotatedInteger} | {error: FlowStateAccessValidationError} {
    const integerPattern = getScalarKind(column.type) === 'unsigned-integer' ? /^\d+$/ : /^-?\d+$/;
    if (!integerPattern.test(trimmed)) {
        return {
            error: {
                errorKey: 'validation_expects-integer',
                params: {name: column.name, type: column.type},
            },
        };
    }
    if (isBigIntegerType(column.type)) {
        const parsed = BigInt(trimmed);
        const range = BIG_INTEGER_RANGES[column.type];
        if (parsed < range.min || parsed > range.max) {
            return {
                error: {
                    errorKey: 'validation_integer-out-of-range',
                    params: {name: column.name, type: column.type},
                },
            };
        }
        return {value: {$type: column.type, $value: parsed.toString()}};
    }
    const value = Number(trimmed);
    const range = INTEGER_RANGES[column.type];
    if (range && (value < range.min || value > range.max)) {
        return {
            error: {
                errorKey: 'validation_integer-out-of-range',
                params: {name: column.name, type: column.type},
            },
        };
    }
    return {value};
}

export function castKeyValue(
    column: FlowKeyColumn,
    raw: string,
): {value: unknown} | {error: FlowStateAccessValidationError} {
    const trimmed = raw.trim();
    if (!trimmed.length) {
        return {error: {errorKey: 'validation_empty-key-value', params: {name: column.name}}};
    }
    switch (getScalarKind(column.type)) {
        case 'signed-integer':
        case 'unsigned-integer':
            return castIntegerKey(column, trimmed);
        case 'number': {
            const value = Number(trimmed);
            if (!Number.isFinite(value)) {
                return {
                    error: {
                        errorKey: 'validation_expects-number',
                        params: {name: column.name, type: column.type},
                    },
                };
            }
            return {value};
        }
        case 'boolean': {
            if (trimmed !== 'true' && trimmed !== 'false') {
                return {
                    error: {errorKey: 'validation_expects-boolean', params: {name: column.name}},
                };
            }
            return {value: trimmed === 'true'};
        }
        case 'string':
            return {value: raw};
        default:
            return {
                error: {
                    errorKey: 'validation_unsupported-key-type',
                    params: {name: column.name, type: column.type},
                },
            };
    }
}

export type RawKeyParseResult =
    | {values: Record<string, string>; error?: never}
    | {values?: never; error: FlowStateValidationError};

export type RuntimeKeyParseResult =
    {value: unknown; error?: never} | {value?: never; error: FlowStateValidationError};

export function parseRuntimeKeyDraft(raw: string): RuntimeKeyParseResult {
    if (!raw.trim()) {
        return {value: undefined};
    }
    try {
        return {value: JSON.parse(raw)};
    } catch {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
}

function splitFlatYsonList(raw: string): Array<string> | undefined {
    const trimmed = raw.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return undefined;
    }
    const content = trimmed.slice(1, -1);
    if (!content.trim()) {
        return [];
    }

    const tokens: Array<string> = [];
    let token = '';
    let insideQuotes = false;
    let escaped = false;
    for (const character of content) {
        if (insideQuotes) {
            token += character;
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                insideQuotes = false;
            }
            continue;
        }
        if (character === '"') {
            insideQuotes = true;
            token += character;
        } else if (character === ';') {
            tokens.push(token);
            token = '';
        } else if ('[]{}<>'.includes(character)) {
            return undefined;
        } else {
            token += character;
        }
    }
    if (insideQuotes || escaped) {
        return undefined;
    }
    tokens.push(token);
    return tokens;
}

function decodeQuotedRawKeyToken(token: string): string | undefined {
    const trimmed = token.trim();
    if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
        return undefined;
    }
    try {
        const decoded: unknown = JSON.parse(trimmed);
        return typeof decoded === 'string' ? decoded : undefined;
    } catch {
        return undefined;
    }
}

type RawKeyTokenDecoder = (value: string) => string | undefined;

const decodeSignedInteger: RawKeyTokenDecoder = (value) =>
    SIGNED_INTEGER_PATTERN.test(value) ? value : undefined;
const decodeUnsignedInteger: RawKeyTokenDecoder = (value) =>
    UNSIGNED_INTEGER_PATTERN.test(value) ? value.slice(0, -1) : undefined;
const decodeFiniteNumber: RawKeyTokenDecoder = (value) =>
    FINITE_NUMBER_PATTERN.test(value) && Number.isFinite(Number(value)) ? value : undefined;
const decodeBoolean: RawKeyTokenDecoder = (value) =>
    value === '%true' || value === '%false' ? value.slice(1) : undefined;

const RAW_KEY_TOKEN_DECODERS: Record<string, RawKeyTokenDecoder> = {
    'signed-integer': decodeSignedInteger,
    'unsigned-integer': decodeUnsignedInteger,
    number: decodeFiniteNumber,
    boolean: decodeBoolean,
};

function decodeRawKeyToken(token: string, column: FlowKeyColumn): string | undefined {
    const trimmed = token.trim();
    if (!trimmed) {
        return undefined;
    }
    if (column.type === 'string') {
        return trimmed.includes('"') ? decodeQuotedRawKeyToken(trimmed) : trimmed;
    }
    if (trimmed.includes('"')) {
        return undefined;
    }
    return RAW_KEY_TOKEN_DECODERS[getScalarKind(column.type) ?? '']?.(trimmed);
}

export function parseRawKeyDraft(raw: string, columns: Array<FlowKeyColumn>): RawKeyParseResult {
    if (!raw.trim()) {
        return {values: Object.fromEntries(columns.map(({name}) => [name, '']))};
    }
    const tokens = splitFlatYsonList(raw);
    if (!tokens) {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
    if (tokens.length === 0) {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
    if (tokens.length !== columns.length) {
        return {
            error: {
                errorKey: 'validation_key-arity',
                params: {expected: String(columns.length)},
            },
        };
    }

    const values: Array<string> = [];
    let blankCount = 0;
    for (let index = 0; index < columns.length; index += 1) {
        if (!tokens[index].trim()) {
            values.push('');
            blankCount += 1;
            continue;
        }
        if (!getScalarKind(columns[index].type)) {
            return {
                error: {
                    errorKey: 'validation_unsupported-key-type',
                    params: {name: columns[index].name, type: columns[index].type},
                },
            };
        }
        const value = decodeRawKeyToken(tokens[index], columns[index]);
        if (value === undefined) {
            return {error: {errorKey: 'validation_invalid-key-syntax'}};
        }
        values.push(value);
    }
    if (blankCount === columns.length) {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
    if (blankCount > 0) {
        return {error: {errorKey: 'validation_fill-all-keys'}};
    }
    for (let index = 0; index < columns.length; index += 1) {
        const casted = castKeyValue(columns[index], values[index]);
        if ('error' in casted) {
            return casted;
        }
    }
    return {
        values: Object.fromEntries(columns.map(({name}, index) => [name, values[index]])),
    };
}

function formatDraftKeyToken(column: FlowKeyColumn, value: string): string {
    switch (getScalarKind(column.type)) {
        case 'signed-integer':
        case 'number':
            return value.trim();
        case 'unsigned-integer':
            return `${value.trim()}u`;
        case 'boolean':
            return `%${value.trim()}`;
        default:
            return JSON.stringify(value);
    }
}

export function formatRawKeyDraft(
    columns: Array<FlowKeyColumn>,
    values: Record<string, string>,
): string {
    const orderedValues = columns.map(({name}) => getOwnProperty(values, name) ?? '');
    if (orderedValues.every((value) => !value)) {
        return '';
    }
    const casted = columns.map((column, index) => castKeyValue(column, orderedValues[index]));
    if (!casted.every((result): result is {value: unknown} => 'value' in result)) {
        return `[${orderedValues.map((value, index) => formatDraftKeyToken(columns[index], value)).join('; ')}]`;
    }
    const key = casted.map((result, index) => {
        const value = result.value;
        return getScalarKind(columns[index].type) === 'unsigned-integer' &&
            typeof value === 'number'
            ? {$type: 'uint64', $value: String(value)}
            : value;
    });
    return prettyPrint(key, {...YSON_AS_TEXT(), decodeUTF8: false});
}
