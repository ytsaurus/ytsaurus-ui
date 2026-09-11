import type {
    FlowRowKeySchema,
    FlowStateFiltersValue,
    FlowStateResultRow,
    FlowStateRowFilterField,
} from './types';

import type {FlowKeyColumn} from '../../../../../shared/yt-types';
import {isAnnotatedBigInteger} from '../../../../store/api/yt/flow/read-states-normalize';
import {reconcileStateName} from './state-filter-options';
import {formatRawKeyDraft} from './state-key';
import {getOwnProperty} from './state-schema';
import {serializeRawStateValue} from './state-value-format';

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
        const values = columns.map((column) => getOwnProperty(record, column.name));
        if (values.some((value) => value === undefined)) {
            return undefined;
        }
        return Object.fromEntries(
            columns.map((column, index) => [column.name, stringifyKeyPart(values[index])]),
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
    if (
        !context.keyColumns.length &&
        row.section !== 'joined_external_key_state' &&
        row.key !== undefined &&
        row.key !== null
    ) {
        return {
            ...filters,
            computationId: row.computationId,
            partitionId: undefined,
            keyValues: {},
            rawKey: row.key,
        };
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
        rawKey: undefined,
        stateName: context.keySchemaStateName ?? filters.stateName,
        target:
            context.keySchemaStateName !== undefined || filters.target === 'partition_state'
                ? 'all'
                : filters.target,
    };
}

export function buildRowKeyPresentation(
    filters: FlowStateFiltersValue,
    row: FlowStateResultRow,
    context: FlowRowKeySchema & {fixedComputationId?: string},
): {rawKey: string; filterUpdate: FlowStateFiltersValue} | undefined {
    const filterUpdate = applyRowKeyClick(filters, row, context);
    if (!filterUpdate) {
        return undefined;
    }
    const rawKey = context.keyColumns.length
        ? formatRawKeyDraft(context.keyColumns, filterUpdate.keyValues)
        : serializeRawStateValue(filterUpdate.rawKey);
    if (!rawKey) {
        return undefined;
    }
    return {
        rawKey,
        filterUpdate,
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
            if (row.section === 'joined_external_key_state') {
                return undefined;
            }
            const target = row.section;
            if (target === filters.target) {
                return {...filters};
            }
            return {
                ...filters,
                target,
                keyValues: target === 'partition_state' ? {} : filters.keyValues,
                rawKey: target === 'partition_state' ? undefined : filters.rawKey,
                stateName: reconcileStateName(filters.stateName, target, context.stateNames),
            };
        }
        case 'computation': {
            if (!row.computationId) {
                return undefined;
            }
            if (context.fixedComputationId && row.computationId !== context.fixedComputationId) {
                return undefined;
            }
            if (row.computationId === filters.computationId) {
                return {...filters};
            }
            return {
                ...filters,
                computationId: row.computationId,
                partitionId: undefined,
                keyValues: {},
                rawKey: undefined,
                stateName: undefined,
            };
        }
        case 'key':
            return buildRowKeyPresentation(filters, row, context)?.filterUpdate;
        case 'partition':
            return row.partitionId ? {...filters, partitionId: row.partitionId} : undefined;
        case 'stateName': {
            if (!row.stateName) {
                return undefined;
            }
            return {...filters, stateName: row.stateName};
        }
        default:
            return undefined;
    }
}
