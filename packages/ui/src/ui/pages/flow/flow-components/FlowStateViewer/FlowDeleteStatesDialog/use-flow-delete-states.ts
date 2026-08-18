import React from 'react';

import {
    useFlowDeleteStatesMutation,
    useFlowPipelineStateQuery,
} from '../../../../../store/api/yt/flow';

import {
    CLOSED_DELETE_DIALOG_STATE,
    countCommitted,
    deleteStatesGate,
    flowDeleteDialogReducer,
    isDeletePreviewCommittable,
    runRowDeletes,
} from '../state-delete';
import {getStateRowId} from '../state-requests';
import type {FlowRowDeleteOutcome, FlowStateResultRow} from '../types';

export type FlowDeleteStatesController = {
    force: boolean;
    busy?: 'preview' | 'delete';
    preview?: Array<FlowRowDeleteOutcome>;
    committed?: Array<FlowRowDeleteOutcome>;
    failed?: Array<FlowRowDeleteOutcome>;
    error?: unknown;
    pipelineStateError?: unknown;
    gate: {blocked: boolean; requiresForce: boolean};
    stateReady: boolean;
    canPreview: boolean;
    canDelete: boolean;
    deleting: boolean;
    setForce: (force: boolean) => void;
    runDeleteStates: (commit: boolean) => void;
};

export function useFlowDeleteStates({
    visible,
    pipeline_path,
    rows,
    onCommitted,
}: {
    visible: boolean;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
    onCommitted: () => void;
}): FlowDeleteStatesController {
    const [dialog, dispatch] = React.useReducer(
        flowDeleteDialogReducer,
        CLOSED_DELETE_DIALOG_STATE,
    );
    const sessionRef = React.useRef(0);
    const [deleteStates] = useFlowDeleteStatesMutation();

    const {
        data: pipelineState,
        error: pipelineStateError,
        isFetching: pipelineStateLoading,
    } = useFlowPipelineStateQuery(
        {parameters: {pipeline_path}},
        {skip: !visible, refetchOnMountOrArgChange: true},
    );

    React.useEffect(() => {
        const session = ++sessionRef.current;
        dispatch(visible ? {type: 'opened', session} : {type: 'closed', session});
    }, [visible]);

    const {force, busy, preview, previewSnapshot, committed, failed, error} = dialog;
    const gate = deleteStatesGate(pipelineState);
    const stateReady = pipelineState !== undefined && !pipelineStateLoading;
    const bodyKey = JSON.stringify(rows.map(getStateRowId));
    const previewValid = isDeletePreviewCommittable(preview, previewSnapshot, bodyKey, force);
    const canPreview = stateReady && !gate.blocked && busy === undefined && rows.length > 0;
    const canDelete =
        previewValid && !gate.blocked && (!gate.requiresForce || force) && busy === undefined;
    const deleting = busy === 'delete';

    const runDeleteStates = (commit: boolean) => {
        const session = sessionRef.current;
        dispatch({type: 'run-started', commit});
        runRowDeletes(rows, (body) => deleteStates({parameters: {pipeline_path}, body}).unwrap(), {
            force,
            commit,
            isCancelled: () => sessionRef.current !== session,
        }).then((outcomes) => {
            dispatch(
                commit
                    ? {type: 'delete-finished', session, outcomes, expected: rows.length}
                    : {type: 'preview-loaded', session, outcomes, snapshot: {bodyKey, force}},
            );
            if (commit && countCommitted(outcomes) > 0) {
                onCommitted();
            }
        });
    };

    return {
        force,
        busy,
        preview,
        committed,
        failed,
        error,
        pipelineStateError,
        gate,
        stateReady,
        canPreview,
        canDelete,
        deleting,
        setForce: (next: boolean) => dispatch({type: 'force-changed', force: next}),
        runDeleteStates,
    };
}
