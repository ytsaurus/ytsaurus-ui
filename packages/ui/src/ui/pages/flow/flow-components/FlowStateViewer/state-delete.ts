import type {
    FlowDeleteDialogEvent,
    FlowDeleteDialogState,
    FlowRowDeleteOutcome,
    FlowStateResultRow,
} from './types';

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

export function isWriteDeniedByPermission(result: {data?: {action?: 'allow' | 'deny'}}): boolean {
    return result.data?.action !== 'allow';
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
