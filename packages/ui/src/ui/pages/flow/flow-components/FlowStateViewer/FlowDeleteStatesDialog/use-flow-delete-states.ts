import React from 'react';

import {
    useFlowDeleteStatesMutation,
    useFlowPipelineStateQuery,
} from '../../../../../store/api/yt/flow';

import {deleteStatesGate, runRowDeletes} from '../state-delete';
import type {FlowRowDeleteOutcome, FlowStateResultRow} from '../types';

export type FlowDeleteStatesController = {
    gate: {blocked: boolean; requiresForce: boolean};
    stateReady: boolean;
    pipelineStateError?: unknown;
    runDeleteStates: (force: boolean) => Promise<Array<FlowRowDeleteOutcome>>;
};

export function useFlowDeleteStates({
    visible,
    pipeline_path,
    rows,
}: {
    visible: boolean;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
}): FlowDeleteStatesController {
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
        sessionRef.current += 1;
    }, [visible, rows]);

    const gate = deleteStatesGate(pipelineState);
    const stateReady = pipelineState !== undefined && !pipelineStateLoading;

    return {
        gate,
        stateReady,
        pipelineStateError,
        runDeleteStates: (force) => {
            const session = sessionRef.current;
            return runRowDeletes(
                rows,
                (body) => deleteStates({parameters: {pipeline_path}, body}).unwrap(),
                {force, isCancelled: () => sessionRef.current !== session},
            );
        },
    };
}
