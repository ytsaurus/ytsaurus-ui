import type {
    FlowKeySchemaResolution,
    FlowRowKeySchema,
    FlowStateAccessValidationError,
    FlowStateFiltersValue,
    FlowStateNameInputMode,
    FlowStateResultRow,
    FlowStateValidationError,
} from './types';

import type {
    FlowAnnotatedInteger,
    FlowKeyColumn,
    FlowStateTarget,
    FlowStaticSpec,
} from '../../../../../shared/yt-types';
import ypath from '../../../../common/thor/ypath';
import {
    BIG_INTEGER_RANGES,
    isBigIntegerType,
} from '../../../../store/api/yt/flow/read-states-normalize';

export function seedStateFilters(
    fixedComputationId: string | undefined,
    initialFilters: Partial<FlowStateFiltersValue> | undefined,
): FlowStateFiltersValue {
    return {
        keyValues: {},
        target: 'all',
        ...initialFilters,
        computationId: fixedComputationId ?? initialFilters?.computationId,
    };
}

function extractGroupByColumns(groupBySchema: unknown): Array<FlowKeyColumn> {
    const columns = ypath.getValue(groupBySchema);
    return Array.isArray(columns) ? (columns as Array<FlowKeyColumn>) : [];
}

export function getComputationGroupByColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Array<FlowKeyColumn> {
    if (!spec?.computations || !computationId) {
        return [];
    }
    return extractGroupByColumns(spec.computations[computationId]?.group_by_schema);
}

function withoutExpressionColumns(columns: Array<FlowKeyColumn>): Array<FlowKeyColumn> {
    return columns.filter((column) => !column.expression);
}

export function getComputationKeyColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Array<FlowKeyColumn> {
    return withoutExpressionColumns(getComputationGroupByColumns(spec, computationId));
}

function getJoinerKeyOverrideColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
): Array<FlowKeyColumn> {
    if (!spec?.computations || !computationId || !stateName) {
        return [];
    }
    const joiner = ypath.getValue(spec.computations[computationId]?.external_state_joiners)?.[
        stateName
    ];
    const joinOn = ypath.getValue(joiner)?.join_on;
    return extractGroupByColumns(ypath.getValue(joinOn)?.key_schema_override);
}

function isDeclaredManager(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
): boolean {
    if (!spec?.computations || !computationId || !stateName) {
        return false;
    }
    return (
        ypath.getValue(spec.computations[computationId]?.external_state_managers)?.[stateName] !==
        undefined
    );
}

export function resolveKeySchema(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
    target: FlowStateTarget,
): FlowKeySchemaResolution {
    const reachesJoiners = target === 'all' || target === 'external_key_state';
    const overrideColumns = reachesJoiners
        ? getJoinerKeyOverrideColumns(spec, computationId, stateName)
        : [];
    const overrideActive =
        overrideColumns.length > 0 && !isDeclaredManager(spec, computationId, stateName);
    const allKeyColumns = overrideActive
        ? overrideColumns
        : getComputationGroupByColumns(spec, computationId);
    return {
        keyColumns: withoutExpressionColumns(allKeyColumns),
        allKeyColumns,
        overrideActive,
    };
}

export function resolveRowKeySchema(
    spec: FlowStaticSpec | undefined,
    row: FlowStateResultRow,
): FlowRowKeySchema {
    const overrideColumns =
        row.section === 'joined_external_key_state'
            ? getJoinerKeyOverrideColumns(spec, row.computationId, row.stateName)
            : [];
    if (!overrideColumns.length) {
        const allKeyColumns = getComputationGroupByColumns(spec, row.computationId);
        return {keyColumns: withoutExpressionColumns(allKeyColumns), allKeyColumns};
    }
    if (isDeclaredManager(spec, row.computationId, row.stateName)) {
        return {keyColumns: [], allKeyColumns: []};
    }
    return {
        keyColumns: withoutExpressionColumns(overrideColumns),
        allKeyColumns: overrideColumns,
        keySchemaStateName: row.stateName,
    };
}

export function getComputationStateNames(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    target: FlowStateTarget,
): Array<string> {
    if (!spec?.computations || !computationId) {
        return [];
    }
    const computation = spec.computations[computationId];
    const managerNames = Object.keys(computation?.external_state_managers ?? {});
    if (target === 'external_key_state') {
        return managerNames;
    }
    const joiners = ypath.getValue(computation?.external_state_joiners);
    const joinerNames =
        joiners && typeof joiners === 'object' && !Array.isArray(joiners)
            ? Object.keys(joiners)
            : [];
    return [...new Set([...managerNames, ...joinerNames])];
}

export function getAvailableStateTargets(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Record<FlowStateTarget, boolean> {
    if (!computationId) {
        return {all: true, key_state: true, partition_state: true, external_key_state: true};
    }
    return {
        all: true,
        key_state: getComputationKeyColumns(spec, computationId).length > 0,
        partition_state: getComputationGroupByColumns(spec, computationId).length > 0,
        external_key_state:
            getComputationStateNames(spec, computationId, 'external_key_state').length > 0,
    };
}

export function reconcileStateTarget(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    target: FlowStateTarget,
): FlowStateTarget {
    return getAvailableStateTargets(spec, computationId)[target] ? target : 'all';
}

export function getStateNameInputMode(target: FlowStateTarget): FlowStateNameInputMode {
    if (target === 'external_key_state') {
        return 'declared-only';
    }
    return target === 'all' ? 'suggested' : 'free-form';
}

export function reconcileStateName(
    stateName: string | undefined,
    target: FlowStateTarget,
    declaredNames: Array<string>,
): string | undefined {
    if (!stateName || getStateNameInputMode(target) !== 'declared-only') {
        return stateName;
    }
    return declaredNames.includes(stateName) ? stateName : undefined;
}

export function getStateNameSelectItems(
    names: Array<string>,
    current: string | undefined,
): Array<string> {
    return current && !names.includes(current) ? [...names, current] : names;
}

const INTEGER_RANGES: Record<string, {min: number; max: number}> = {
    int8: {min: -128, max: 127},
    int16: {min: -32768, max: 32767},
    int32: {min: -2147483648, max: 2147483647},
    uint8: {min: 0, max: 255},
    uint16: {min: 0, max: 65535},
    uint32: {min: 0, max: 4294967295},
};

function castIntegerKey(
    column: FlowKeyColumn,
    trimmed: string,
): {value: number | FlowAnnotatedInteger} | {error: FlowStateAccessValidationError} {
    const integerPattern = column.type.startsWith('uint') ? /^\d+$/ : /^-?\d+$/;
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
    switch (column.type) {
        case 'int64':
        case 'int32':
        case 'int16':
        case 'int8':
        case 'uint64':
        case 'uint32':
        case 'uint16':
        case 'uint8':
            return castIntegerKey(column, trimmed);
        case 'double':
        case 'float': {
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
        default:
            return {value: raw};
    }
}

export type RawKeyParseResult =
    | {values: Record<string, string>; error?: never}
    | {values?: never; error: FlowStateValidationError};

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

function decodeRawKeyToken(token: string): string | undefined {
    const trimmed = token.trim();
    if (!trimmed.includes('"')) {
        return trimmed;
    }
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

export function parseRawKeyDraft(raw: string, columns: Array<FlowKeyColumn>): RawKeyParseResult {
    if (!raw.trim()) {
        return {values: Object.fromEntries(columns.map(({name}) => [name, '']))};
    }
    const tokens = splitFlatYsonList(raw);
    if (!tokens) {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
    if (tokens.length === 0) {
        return {values: Object.fromEntries(columns.map(({name}) => [name, '']))};
    }
    if (tokens.length !== columns.length) {
        return {
            error: {
                errorKey: 'validation_key-arity',
                params: {expected: String(columns.length)},
            },
        };
    }

    const decoded = tokens.map(decodeRawKeyToken);
    if (decoded.some((value) => value === undefined)) {
        return {error: {errorKey: 'validation_invalid-key-syntax'}};
    }
    const values = decoded as Array<string>;
    const filledCount = values.filter((value) => value.trim()).length;
    if (filledCount !== 0 && filledCount !== columns.length) {
        return {error: {errorKey: 'validation_fill-all-keys'}};
    }
    if (filledCount > 0) {
        for (let index = 0; index < columns.length; index += 1) {
            const casted = castKeyValue(columns[index], values[index]);
            if ('error' in casted) {
                return casted;
            }
        }
    }
    return {
        values: Object.fromEntries(columns.map(({name}, index) => [name, values[index]])),
    };
}

function formatRawKeyToken(value: string): string {
    return value.trim() !== value || /[;"\\[\]{}<>]/.test(value) ? JSON.stringify(value) : value;
}

export function formatRawKeyDraft(
    columns: Array<FlowKeyColumn>,
    values: Record<string, string>,
): string {
    const orderedValues = columns.map(({name}) => values[name] ?? '');
    return orderedValues.every((value) => !value)
        ? ''
        : `[${orderedValues.map(formatRawKeyToken).join('; ')}]`;
}
