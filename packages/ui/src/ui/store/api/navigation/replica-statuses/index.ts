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
