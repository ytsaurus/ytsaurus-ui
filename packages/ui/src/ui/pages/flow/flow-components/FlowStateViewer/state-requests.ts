import type {
    FlowKeySchemaResolution,
    FlowStateAccessValidationError,
    FlowStateFiltersValue,
    FlowStateResultRow,
} from './types';

import type {
    FlowKeyColumn,
    FlowReadStatesResponse,
    FlowStateAccessBody,
} from '../../../../../shared/yt-types';
import {castKeyValue} from './state-filters';

export const READ_STATES_LIMIT = 10;

export function buildStateAccessBody(
    filters: FlowStateFiltersValue,
    keyColumns: Array<FlowKeyColumn>,
): {body: FlowStateAccessBody} | {error: FlowStateAccessValidationError} {
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
): {body: FlowStateAccessBody} | {error: FlowStateAccessValidationError} {
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

export const AUTO_LOAD_DEBOUNCE_MS = 400;
