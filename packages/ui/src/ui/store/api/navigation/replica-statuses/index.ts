import {useCallback, useEffect, useMemo} from 'react';
import {skipToken} from '@reduxjs/toolkit/query';

import {useDispatch, useSelector} from '../../../redux-hooks';
import {abortAndReset, loadReplicas} from '../../../actions/navigation/content/replicated-table';
import {
    selectReplicatedTableData,
    selectReplicatedTableReplicasMap,
    selectReplicatedTableRequestKey,
} from '../../../selectors/navigation/content/replicated-table';
import {useUpdater} from '../../../../hooks/use-updater';

import {rootApi} from '../..';
import {type ReplicaStatuses, type ReplicaStatusesArgs, fetchReplicaStatuses} from './endpoints';

export const replicaStatusesApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        replicaStatuses: build.query<ReplicaStatuses, ReplicaStatusesArgs>({
            queryFn: fetchReplicaStatuses,
        }),
    }),
});

export const {useReplicaStatusesQuery} = replicaStatusesApi;
export type {ReplicaDiagnostics} from './endpoints';

export function useReplicaStatuses() {
    const dispatch = useDispatch();
    const requestKey = useSelector(selectReplicatedTableRequestKey);
    const state = useSelector(selectReplicatedTableData);
    const replicasMap = useSelector(selectReplicatedTableReplicasMap);
    const replicas = useMemo(
        () =>
            Object.entries(replicasMap).flatMap(([id, replica]) =>
                replica ? [{id, cluster: replica.cluster_name, path: replica.replica_path}] : [],
            ),
        [replicasMap],
    );
    const load = useCallback(() => dispatch(loadReplicas(requestKey)), [dispatch, requestKey]);
    const cancel = useCallback(() => dispatch(abortAndReset()), [dispatch]);
    useUpdater(load, {destructFn: cancel});

    const query = useReplicaStatusesQuery(state.loaded ? {requestKey, replicas} : skipToken, {
        refetchOnMountOrArgChange: true,
    });
    const {refetch, isUninitialized} = query;
    // Reload diagnostics when the list is refreshed, even if its paths have not changed.
    useEffect(() => {
        if (!isUninitialized) {
            refetch();
        }
    }, [replicas, refetch, isUninitialized]);

    return {
        replicas,
        diagnostics: state.loaded ? query.currentData : undefined,
        error: state.errorData,
        loading: !state.loaded && !state.error,
    };
}
