import React from 'react';

import {
    useFlowDeleteStatesMutation,
    useFlowPipelineStateQuery,
} from '../../../../../store/api/yt/flow';

import {
    type FlowDeletePermissionQuery,
    type FlowDeleteStatesRunResult,
    deleteStatesGate,
    isWriteDeniedByPermission,
    runDeleteAttempt,
} from '../state-delete';
import type {FlowStateResultRow} from '../types';

export type FlowDeleteStatesController = {
    gate: {blocked: boolean; requiresForce: boolean};
    stateReady: boolean;
    permissionReady: boolean;
    pipelineStateError?: unknown;
    permissionError?: unknown;
    runDeleteStates: (force: boolean) => Promise<FlowDeleteStatesRunResult>;
};

export function useFlowDeleteStates({
    visible,
    pipeline_path,
    rows,
    permission,
}: {
    visible: boolean;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
    permission: FlowDeletePermissionQuery;
}): FlowDeleteStatesController {
    const sessionRef = React.useRef(0);
    const [deleteStates] = useFlowDeleteStatesMutation();
    const {
        data: pipelineState,
        error: pipelineStateError,
        isFetching: pipelineStateLoading,
        refetch: refetchPipelineState,
    } = useFlowPipelineStateQuery(
        {parameters: {pipeline_path}},
        {skip: !visible, refetchOnMountOrArgChange: true},
    );

    React.useEffect(() => {
        sessionRef.current += 1;
    }, [visible, rows]);

    React.useEffect(() => {
        return () => {
            sessionRef.current += 1;
        };
    }, []);

    const pipelineGate = deleteStatesGate(pipelineState);
    const stateReady =
        pipelineState !== undefined && !pipelineStateLoading && pipelineStateError === undefined;
    const permissionReady = !isWriteDeniedByPermission(permission);
    const isSessionCurrent = (session: number) => sessionRef.current === session;

    return {
        gate: pipelineGate,
        stateReady,
        permissionReady,
        pipelineStateError,
        permissionError: permission.error,
        runDeleteStates: async (force) => {
            const session = sessionRef.current + 1;
            sessionRef.current = session;
            return runDeleteAttempt({
                session,
                rows,
                force,
                refreshPermission: () => permission.refetch().unwrap(),
                refreshPipelineState: () => refetchPipelineState().unwrap(),
                execute: (body) => deleteStates({parameters: {pipeline_path}, body}).unwrap(),
                isSessionCurrent,
            });
        },
    };
}
