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
    runRowDeletes,
} from '../state-delete';
import type {FlowStateResultRow} from '../types';

export type FlowDeleteStatesController = {
    gate: {blocked: boolean; requiresForce: boolean};
    stateReady: boolean;
    permissionReady: boolean;
    pipelineStateError?: unknown;
    permissionError?: unknown;
    runDeleteStates: (force: boolean) => Promise<FlowDeleteStatesRunResult>;
    isSessionCurrent: (session: number) => boolean;
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
        isSessionCurrent,
        runDeleteStates: async (force) => {
            const session = sessionRef.current + 1;
            sessionRef.current = session;
            let freshPermission;
            let freshPipelineState;
            try {
                [freshPermission, freshPipelineState] = await Promise.all([
                    permission.refetch().unwrap(),
                    refetchPipelineState().unwrap(),
                ]);
            } catch {
                return isSessionCurrent(session)
                    ? {session, status: 'blocked'}
                    : {session, status: 'stale'};
            }
            if (!isSessionCurrent(session)) {
                return {session, status: 'stale'};
            }
            const freshGate = deleteStatesGate(freshPipelineState);
            if (
                freshPermission?.action !== 'allow' ||
                freshGate.blocked ||
                (freshGate.requiresForce && !force)
            ) {
                return {session, status: 'blocked'};
            }
            const outcomes = await runRowDeletes(
                rows,
                (body) => deleteStates({parameters: {pipeline_path}, body}).unwrap(),
                {force, isCancelled: () => !isSessionCurrent(session)},
            );
            return isSessionCurrent(session)
                ? {session, status: 'completed', outcomes}
                : {session, status: 'stale'};
        },
    };
}
