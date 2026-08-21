import type {FlowRowDeleteOutcome, FlowStateResultRow} from './types';

import type {
    FlowDeleteStatesBody,
    FlowDeleteStatesResponse,
    FlowStateAccessBody,
    GetPipelineStateData,
} from '../../../../../shared/yt-types';
import {getStateRowId, isRowDeletable} from './state-requests';

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

export function isWriteDeniedByPermission(result: {
    data?: {action?: 'allow' | 'deny'};
    error?: unknown;
    isFetching?: boolean;
}): boolean {
    return result.data?.action !== 'allow' || Boolean(result.error) || Boolean(result.isFetching);
}

export type FlowDeletePermissionQuery = {
    data?: {action?: 'allow' | 'deny'};
    error?: unknown;
    isFetching?: boolean;
    refetch: () => {unwrap: () => Promise<{action: 'allow' | 'deny'} | undefined>};
};

export type FlowDeleteStatesRunResult =
    | {session: number; status: 'blocked' | 'stale'}
    | {session: number; status: 'completed'; outcomes: Array<FlowRowDeleteOutcome>};

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
    options: {force: boolean; isCancelled?: () => boolean},
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
                commit: true,
            });
            if (options.isCancelled?.()) {
                break;
            }
            outcomes.push({rowId, response});
            if (!isDeleteCommitted(response)) {
                break;
            }
        } catch (error) {
            if (options.isCancelled?.()) {
                break;
            }
            outcomes.push({rowId, error});
            break;
        }
    }
    return outcomes;
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

export function isDeleteCommitted(response: FlowDeleteStatesResponse): boolean {
    return response.committed === true && !response.errors?.length;
}
