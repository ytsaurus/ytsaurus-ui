import type {
    FlowRowKeySchema,
    FlowStateFiltersValue,
    FlowStateResultRow,
    FlowStateRowFilterField,
    FlowStateStorageLocation,
} from './types';

import type {FlowKeyColumn, FlowStaticSpec} from '../../../../../shared/yt-types';
import type {YsonSettings} from '../../../../components/Yson/Yson';
import ypath from '../../../../common/thor/ypath';
import {isAnnotatedBigInteger} from '../../../../store/api/yt/flow/read-states-normalize';
import {reconcileStateName} from './state-filters';

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
