import type {
    FlowDeleteDialogEvent,
    FlowDeleteDialogState,
    FlowHeavyHitterEntry,
    FlowHeavyHitterStateSeed,
    FlowHeavyHittersMessageData,
    FlowKeySchemaResolution,
    FlowRowDeleteOutcome,
    FlowRowKeySchema,
    FlowStateFiltersValue,
    FlowStateNameInputMode,
    FlowStateResultRow,
    FlowStateRowFilterField,
    FlowStateStorageLocation,
    FlowStateValidationError,
} from './types';

import {Page} from '../../../../../shared/constants/settings';
import type {
    FlowAnnotatedInteger,
    FlowDeleteStatesBody,
    FlowDeleteStatesResponse,
    FlowKeyColumn,
    FlowMessageType,
    FlowReadStatesResponse,
    FlowStateAccessBody,
    FlowStateTarget,
    FlowStaticSpec,
    GetPipelineStateData,
} from '../../../../../shared/yt-types';
import type {YsonSettings} from '../../../../components/Yson/Yson';
import ypath from '../../../../common/thor/ypath';
import {
    BIG_INTEGER_RANGES,
    isAnnotatedBigInteger,
    isBigIntegerType,
} from '../../../../store/api/yt/flow/read-states-normalize';

export function seedStateFilters(
    fixedComputationId: string | undefined,
    initialFilters: Partial<FlowStateFiltersValue> | undefined,
): FlowStateFiltersValue {
    return {
        keyValues: {},
        target: 'all',
        limit: 10,
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
): {value: number | FlowAnnotatedInteger} | {error: FlowStateValidationError} {
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
): {value: unknown} | {error: FlowStateValidationError} {
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

export function buildStateAccessBody(
    filters: FlowStateFiltersValue,
    keyColumns: Array<FlowKeyColumn>,
): {body: FlowStateAccessBody} | {error: FlowStateValidationError} {
    const body: FlowStateAccessBody = {};
    if (filters.partitionId) {
        body.partition_id = filters.partitionId;
    } else if (filters.computationId) {
        body.computation_id = filters.computationId;
        const filledColumns = keyColumns.filter((column) =>
            Boolean(filters.keyValues[column.name]?.trim()),
        );
        if (filledColumns.length) {
            if (filledColumns.length !== keyColumns.length) {
                return {error: {errorKey: 'validation_fill-all-keys'}};
            }
            if (filters.target === 'partition_state') {
                return {error: {errorKey: 'validation_key-target-mismatch'}};
            }
            const key: Record<string, unknown> = {};
            for (const column of filledColumns) {
                const casted = castKeyValue(column, filters.keyValues[column.name]);
                if ('error' in casted) {
                    return casted;
                }
                key[column.name] = casted.value;
            }
            body.key = key;
        }
    } else {
        return {error: {errorKey: 'validation_no-scope'}};
    }
    if (filters.stateName) {
        body.name = filters.stateName;
    }
    if (filters.target !== 'all') {
        body.target = filters.target;
    }
    return {body};
}

export function buildStateReadBody(
    filters: FlowStateFiltersValue,
    keySchema: FlowKeySchemaResolution,
): {body: FlowStateAccessBody} | {error: FlowStateValidationError} {
    const built = buildStateAccessBody(filters, keySchema.keyColumns);
    if ('error' in built || built.body.key === undefined || !keySchema.overrideActive) {
        return built;
    }
    return {body: {...built.body, target: 'external_key_state'}};
}

const SECTION_FIELDS = [
    ['key_states', 'key_state'],
    ['partition_states', 'partition_state'],
    ['external_key_states', 'external_key_state'],
    ['joined_external_key_states', 'joined_external_key_state'],
] as const;

export function flattenReadStatesResponse(
    response: FlowReadStatesResponse | undefined,
): Array<FlowStateResultRow> {
    if (!response) {
        return [];
    }
    const rows: Array<FlowStateResultRow> = [];
    for (const [field, section] of SECTION_FIELDS) {
        for (const item of response[field] ?? []) {
            const {states} = item;
            const partitionId = 'partition_id' in item ? item.partition_id : undefined;
            const key = 'key' in item ? item.key : undefined;
            for (const [stateName, value] of Object.entries(states ?? {})) {
                rows.push({
                    section,
                    computationId: item.computation_id,
                    partitionId,
                    key,
                    stateName,
                    value,
                });
            }
        }
    }
    return rows;
}

export function deleteStatesGate(current: GetPipelineStateData | undefined): {
    blocked: boolean;
    requiresForce: boolean;
} {
    if (current === 'Stopped' || current === 'Completed') {
        return {blocked: false, requiresForce: false};
    }
    if (current === 'Paused') {
        return {blocked: false, requiresForce: true};
    }
    return {blocked: true, requiresForce: false};
}

export function isWriteDeniedByPermission(result: {data?: {action?: 'allow' | 'deny'}}): boolean {
    return result.data?.action !== 'allow';
}

export function getStateRowId(row: FlowStateResultRow): string {
    return [
        row.section,
        row.computationId ?? '',
        row.partitionId ?? '',
        row.key === undefined ? '' : JSON.stringify(row.key),
        row.stateName,
    ].join('|');
}

export function isRowDeletable(row: FlowStateResultRow): boolean {
    return row.section !== 'joined_external_key_state';
}

export function selectDeletableRows(
    rows: Array<FlowStateResultRow>,
    rowSelection: Record<string, boolean>,
): Array<FlowStateResultRow> {
    return rows.filter((row) => rowSelection[getStateRowId(row)] && isRowDeletable(row));
}

export function buildRowDeleteBody(row: FlowStateResultRow): FlowStateAccessBody {
    if (!isRowDeletable(row)) {
        throw new Error(`A ${row.section} row has no deletable target of its own`);
    }
    if (row.section === 'partition_state') {
        return {partition_id: row.partitionId, name: row.stateName, target: 'partition_state'};
    }
    return {
        computation_id: row.computationId,
        key: row.key,
        name: row.stateName,
        target: row.section === 'external_key_state' ? 'external_key_state' : 'key_state',
    };
}

export async function runRowDeletes(
    rows: Array<FlowStateResultRow>,
    execute: (body: FlowDeleteStatesBody) => Promise<FlowDeleteStatesResponse>,
    options: {force: boolean; commit: boolean; isCancelled?: () => boolean},
): Promise<Array<FlowRowDeleteOutcome>> {
    const outcomes: Array<FlowRowDeleteOutcome> = [];
    for (const row of rows) {
        if (options.isCancelled?.()) {
            break;
        }
        const rowId = getStateRowId(row);
        try {
            const response = await execute({
                ...buildRowDeleteBody(row),
                force: options.force,
                commit: options.commit,
            });
            outcomes.push({rowId, response});
            if (options.commit && !isDeleteCommitted(response)) {
                break;
            }
        } catch (error) {
            outcomes.push({rowId, error});
            break;
        }
    }
    return outcomes;
}

export function areOutcomesClean(outcomes: Array<FlowRowDeleteOutcome>): boolean {
    return outcomes.every(
        (outcome) =>
            outcome.error === undefined &&
            outcome.response !== undefined &&
            !outcome.response.errors?.length,
    );
}

export function areAllCommitted(outcomes: Array<FlowRowDeleteOutcome>, expected: number): boolean {
    return (
        outcomes.length === expected &&
        outcomes.every(
            (outcome) => outcome.response !== undefined && isDeleteCommitted(outcome.response),
        )
    );
}

export function countCommitted(outcomes: Array<FlowRowDeleteOutcome>): number {
    return outcomes.filter(
        (outcome) => outcome.response !== undefined && isDeleteCommitted(outcome.response),
    ).length;
}

export function aggregateMatchedTotal(outcomes: Array<FlowRowDeleteOutcome>): number {
    return outcomes.reduce((sum, outcome) => {
        const buckets = outcome.response?.matched_states;
        return (
            sum +
            (buckets?.key_states?.total ?? 0) +
            (buckets?.partition_states?.total ?? 0) +
            (buckets?.external_key_states?.total ?? 0)
        );
    }, 0);
}

export function isDeletePreviewCommittable(
    preview: Array<FlowRowDeleteOutcome> | undefined,
    snapshot: {bodyKey: string; force: boolean} | undefined,
    bodyKey: string,
    force: boolean,
): boolean {
    return (
        preview !== undefined &&
        areOutcomesClean(preview) &&
        snapshot?.bodyKey === bodyKey &&
        snapshot?.force === force
    );
}

export function isDeleteCommitted(response: FlowDeleteStatesResponse): boolean {
    return response.committed === true && !response.errors?.length;
}

export const AUTO_LOAD_DEBOUNCE_MS = 400;

export const CLOSED_DELETE_DIALOG_STATE: FlowDeleteDialogState = {session: 0, force: false};

export function flowDeleteDialogReducer(
    state: FlowDeleteDialogState,
    event: FlowDeleteDialogEvent,
): FlowDeleteDialogState {
    switch (event.type) {
        case 'opened':
            return {session: event.session, force: false};
        case 'closed':
            return {session: event.session, force: false};
        case 'force-changed':
            return {...state, force: event.force};
        case 'run-started':
            return {
                ...state,
                busy: event.commit ? 'delete' : 'preview',
                preview: event.commit ? state.preview : undefined,
                previewSnapshot: event.commit ? state.previewSnapshot : undefined,
                failed: undefined,
                error: undefined,
            };
        case 'preview-loaded':
            return event.session === state.session
                ? {
                      ...state,
                      preview: event.outcomes,
                      previewSnapshot: event.snapshot,
                      busy: undefined,
                  }
                : state;
        case 'delete-finished':
            if (event.session !== state.session) {
                return state;
            }
            return areAllCommitted(event.outcomes, event.expected)
                ? {...state, committed: event.outcomes, busy: undefined}
                : {...state, failed: event.outcomes, busy: undefined};
        case 'request-failed':
            return event.session === state.session
                ? {...state, error: event.error, busy: undefined}
                : state;
        default:
            return state;
    }
}

const DEFAULT_STATE_LIMIT = 10;
const MAX_STATE_LIMIT = 10000;

export function clampLimit(value: number): number {
    if (!Number.isFinite(value)) {
        return DEFAULT_STATE_LIMIT;
    }
    return Math.min(MAX_STATE_LIMIT, Math.max(1, Math.trunc(value)));
}

function replaceAnnotatedIntegers(_key: string, value: unknown): unknown {
    return isAnnotatedBigInteger(value) ? value.$value : value;
}

export function stringifyStateValue(value: unknown, maxLength = 200): string {
    if (isAnnotatedBigInteger(value)) {
        return value.$value;
    }
    const text = JSON.stringify(value, replaceAnnotatedIntegers);
    if (text === undefined) {
        return '';
    }
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function serializeRawStateValue(value: unknown): string {
    if (isAnnotatedBigInteger(value)) {
        return value.$value;
    }
    const text = JSON.stringify(value, replaceAnnotatedIntegers);
    return text === undefined ? '' : text;
}

export function buildCompactYsonSettings(base: YsonSettings): YsonSettings {
    return {...base, compact: true, indent: 0, break: false};
}

function stringifyKeyPart(value: unknown): string {
    if (isAnnotatedBigInteger(value)) {
        return value.$value;
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
}

export function keyValuesFromRowKey(
    key: unknown,
    columns: Array<FlowKeyColumn>,
    allColumns: Array<FlowKeyColumn> = columns,
): Record<string, string> | undefined {
    if (key === undefined || key === null || !columns.length) {
        return undefined;
    }
    if (Array.isArray(key)) {
        if (key.length === columns.length) {
            return Object.fromEntries(
                columns.map((column, index) => [column.name, stringifyKeyPart(key[index])]),
            );
        }
        if (key.length === allColumns.length) {
            const pairs = allColumns
                .map((column, index) => [column, key[index]] as const)
                .filter(([column]) => !column.expression);
            if (pairs.length !== columns.length) {
                return undefined;
            }
            return Object.fromEntries(
                pairs.map(([column, value]) => [column.name, stringifyKeyPart(value)]),
            );
        }
        return undefined;
    }
    if (typeof key === 'object') {
        const record = key as Record<string, unknown>;
        if (!columns.every((column) => column.name in record)) {
            return undefined;
        }
        return Object.fromEntries(
            columns.map((column) => [column.name, stringifyKeyPart(record[column.name])]),
        );
    }
    if (columns.length === 1) {
        return {[columns[0].name]: stringifyKeyPart(key)};
    }
    return undefined;
}

function applyRowKeyClick(
    filters: FlowStateFiltersValue,
    row: FlowStateResultRow,
    context: FlowRowKeySchema & {fixedComputationId?: string},
): FlowStateFiltersValue | undefined {
    if (!row.computationId) {
        return undefined;
    }
    if (context.fixedComputationId && row.computationId !== context.fixedComputationId) {
        return undefined;
    }
    const keyValues = keyValuesFromRowKey(row.key, context.keyColumns, context.allKeyColumns);
    if (!keyValues) {
        return undefined;
    }
    return {
        ...filters,
        computationId: row.computationId,
        partitionId: undefined,
        keyValues,
        stateName: context.keySchemaStateName ?? filters.stateName,
        target:
            context.keySchemaStateName !== undefined || filters.target === 'partition_state'
                ? 'all'
                : filters.target,
    };
}

export function buildRowFilterUpdate(
    filters: FlowStateFiltersValue,
    row: FlowStateResultRow,
    field: FlowStateRowFilterField,
    context: FlowRowKeySchema & {stateNames: Array<string>; fixedComputationId?: string},
): FlowStateFiltersValue | undefined {
    switch (field) {
        case 'target': {
            if (row.section === 'joined_external_key_state' || row.section === filters.target) {
                return undefined;
            }
            const target = row.section;
            return {
                ...filters,
                target,
                keyValues: target === 'partition_state' ? {} : filters.keyValues,
                stateName: reconcileStateName(filters.stateName, target, context.stateNames),
            };
        }
        case 'computation': {
            if (!row.computationId || row.computationId === filters.computationId) {
                return undefined;
            }
            if (context.fixedComputationId && row.computationId !== context.fixedComputationId) {
                return undefined;
            }
            return {
                ...filters,
                computationId: row.computationId,
                partitionId: undefined,
                keyValues: {},
                stateName: undefined,
            };
        }
        case 'key':
            return applyRowKeyClick(filters, row, context);
        case 'stateName': {
            if (!row.stateName || row.stateName === filters.stateName) {
                return undefined;
            }
            return {...filters, stateName: row.stateName};
        }
        default:
            return undefined;
    }
}

export function resolveStateStoragePath(
    row: FlowStateResultRow,
    pipelinePath: string,
    spec: FlowStaticSpec | undefined,
): FlowStateStorageLocation | undefined {
    if (row.section === 'key_state') {
        return {path: `${pipelinePath}/states`};
    }
    if (row.section === 'partition_state') {
        return {path: `${pipelinePath}/partition_states`};
    }
    if (!row.computationId) {
        return undefined;
    }
    const computation = spec?.computations?.[row.computationId];
    const declarations =
        row.section === 'external_key_state'
            ? computation?.external_state_managers
            : computation?.external_state_joiners;
    const declaration = ypath.getValue(declarations)?.[row.stateName];
    const pathNode = ypath.getValue(ypath.getValue(declaration)?.parameters)?.path;
    const path = ypath.getValue(pathNode);
    if (typeof path !== 'string' || !path.length) {
        return undefined;
    }
    const cluster = ypath.getAttributes(pathNode)['cluster'];
    return {path, cluster: typeof cluster === 'string' ? cluster : undefined};
}

const HEAVY_HITTERS_TITLE_PATTERN = /^Top \d+ heavy hitters$/;
const HEAVY_HITTER_ENTRY_PATTERN = /^Key=([\s\S]*), Ratio=([^,]+), PartitionId=([^,]+)$/;
const KEY_TOKEN_ID_PATTERN = /^(\d+)#([\s\S]*)$/;

function parseHeavyHittersMessage(
    message: FlowMessageType,
): FlowHeavyHittersMessageData | undefined {
    const list = ypath.getValue(message.yson);
    if (!Array.isArray(list)) {
        return undefined;
    }
    const entries: Array<FlowHeavyHitterEntry> = [];
    const unparsedEntries: Array<string> = [];
    for (const item of list) {
        const line = ypath.getValue(item);
        if (typeof line !== 'string') {
            unparsedEntries.push(JSON.stringify(line));
            continue;
        }
        const parsed = HEAVY_HITTER_ENTRY_PATTERN.exec(line);
        const ratio = parsed ? Number(parsed[2]) : Number.NaN;
        if (!parsed || !Number.isFinite(ratio)) {
            unparsedEntries.push(line);
            continue;
        }
        entries.push({keyText: parsed[1], ratio, partitionId: parsed[3]});
    }
    return {title: message.text?.trim() ?? '', entries, unparsedEntries};
}

export function splitHeavyHittersMessages(messages: Array<FlowMessageType> | undefined): {
    heavyHitters?: FlowHeavyHittersMessageData;
    otherMessages: Array<FlowMessageType>;
} {
    const list = messages ?? [];
    const index = list.findIndex(
        (candidate) =>
            candidate.yson !== undefined &&
            HEAVY_HITTERS_TITLE_PATTERN.test(candidate.text?.trim() ?? ''),
    );
    const heavyHitters = index < 0 ? undefined : parseHeavyHittersMessage(list[index]);
    if (!heavyHitters) {
        return {otherMessages: list};
    }
    return {heavyHitters, otherMessages: list.filter((_, position) => position !== index)};
}

function splitKeyTokens(inner: string): Array<string> | undefined {
    const tokens: Array<string> = [];
    let current = '';
    let inQuotes = false;
    for (const char of inner) {
        if (char === '\\') {
            return undefined;
        }
        if (char === '"') {
            inQuotes = !inQuotes;
        }
        if (char === ',' && !inQuotes) {
            tokens.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }
    if (inQuotes) {
        return undefined;
    }
    tokens.push(current.trim());
    return tokens;
}

function keyValueToText(value: string): string | undefined {
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    if (value === '%true' || value === '%false') {
        return value.slice(1);
    }
    if (/^-?\d+u?$/.test(value)) {
        return value.endsWith('u') ? value.slice(0, -1) : value;
    }
    return undefined;
}

function keyTokenToText(token: string, position: number): string | undefined {
    const withColumnId = KEY_TOKEN_ID_PATTERN.exec(token);
    if (!withColumnId) {
        return keyValueToText(token);
    }
    return Number(withColumnId[1]) === position ? keyValueToText(withColumnId[2]) : undefined;
}

export function parseHeavyHitterKeyText(keyText: string): Array<string> | undefined {
    const trimmed = keyText.trim();
    if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return undefined;
    }
    const tokens = splitKeyTokens(trimmed.slice(1, -1).trim());
    if (!tokens) {
        return undefined;
    }
    const parts = tokens.map(keyTokenToText);
    return parts.every((part) => part !== undefined) ? (parts as Array<string>) : undefined;
}

export function buildHeavyHitterStateLink(
    cluster: string,
    pipelinePath: string,
    computationId: string,
    seed: FlowHeavyHitterStateSeed,
): string {
    const params = new URLSearchParams({
        path: pipelinePath,
        heavyHitterSeed: JSON.stringify(seed),
    });
    return `/${cluster}/${Page.FLOWS}/computations/${encodeURIComponent(computationId)}/state?${params}`;
}

export function parseHeavyHitterStateSeed(
    raw: string | null,
): FlowHeavyHitterStateSeed | undefined {
    if (!raw) {
        return undefined;
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return undefined;
    }
    if (!parsed || typeof parsed !== 'object') {
        return undefined;
    }
    const {partitionId, keyValues} = parsed as Record<string, unknown>;
    const seed: FlowHeavyHitterStateSeed = {};
    if (typeof partitionId === 'string') {
        seed.partitionId = partitionId;
    }
    if (keyValues && typeof keyValues === 'object') {
        const entries = Object.entries(keyValues as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
        );
        if (entries.length) {
            seed.keyValues = Object.fromEntries(entries);
        }
    }
    return Object.keys(seed).length ? seed : undefined;
}
