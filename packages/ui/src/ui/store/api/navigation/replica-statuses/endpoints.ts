import {type BaseQueryApi} from '@reduxjs/toolkit/query';

import {YTApiId} from '../../../../rum/rum-wrap-api';
import {type YTError} from '../../../../types';
import CancelHelper from '../../../../utils/cancel-helper';
import {normalizeError} from '../../../../utils/normalize-error';
import {executeBatchV3} from '../../yt/executeBatch/endpoint';
import {getEffectiveClusterArgs} from '../../yt/utils';

type ClusterId = string;
type ReplicaId = string;

export interface DiagnosticReplica {
    id: ReplicaId;
    cluster: ClusterId;
    path: string;
}

type QueueAgentStatus = {error?: YTError; alerts?: Record<string, YTError>};
type ReplicaAttributes = {
    queue_status?: QueueAgentStatus;
    queue_consumer_status?: QueueAgentStatus;
};

export type ReplicaDiagnostics = {
    output?: {alerts: YTError[]; errors: YTError[]};
    error?: YTError;
};

export type ReplicaStatuses = Record<ReplicaId, ReplicaDiagnostics>;

export type ReplicaStatusesArgs = {
    requestKey: string;
    replicas: DiagnosticReplica[];
};

export async function fetchReplicaStatuses(
    {replicas}: ReplicaStatusesArgs,
    {signal}: BaseQueryApi,
) {
    const groups: Record<ClusterId, DiagnosticReplica[]> = {};
    for (const replica of replicas) {
        (groups[replica.cluster] ??= []).push(replica);
    }

    const requests = new CancelHelper();
    signal.addEventListener('abort', requests.removeAllRequests);
    try {
        const groupsResults = await Promise.all(
            Object.entries(groups).map(([cluster, clusterReplicas]) =>
                fetchClusterReplicaStatuses(cluster, clusterReplicas, requests.saveCancelToken),
            ),
        );
        return {data: Object.assign({}, ...groupsResults)};
    } finally {
        signal.removeEventListener('abort', requests.removeAllRequests);
    }
}

async function fetchClusterReplicaStatuses(
    cluster: ClusterId,
    clusterReplicas: DiagnosticReplica[],
    cancellation: CancelHelper['saveCancelToken'],
) {
    const results: ReplicaStatuses = {};
    try {
        const response = await executeBatchV3(
            getEffectiveClusterArgs(
                {
                    cluster,
                    id: YTApiId.navigationReplicaStatuses,
                    errorTitle: 'Failed to load replica diagnostics',
                    allowPartialResults: true,
                    parameters: {
                        requests: clusterReplicas.map(({path}) => ({
                            command: 'get' as const,
                            parameters: {
                                path: `${path}/@`,
                                attributes: ['queue_status', 'queue_consumer_status'],
                            },
                        })),
                    },
                    cancellation,
                },
                cluster,
            ),
        );
        if ('error' in response) {
            throw response.error;
        }
        const {data} = response;
        clusterReplicas.forEach(({id}, index) => {
            const result = data[index];
            if (result.error) {
                results[id] = {error: result.error};
                return;
            }
            const attributes = result.output as ReplicaAttributes;
            const output: Required<ReplicaDiagnostics>['output'] = {
                alerts: [],
                errors: [],
            };
            for (const status of [attributes.queue_status, attributes.queue_consumer_status]) {
                output.alerts.push(...Object.values(status?.alerts ?? {}));
                if (status?.error) {
                    output.errors.push(status.error);
                }
            }
            results[id] = {output};
        });
    } catch (error) {
        for (const {id} of clusterReplicas) {
            results[id] = {error: normalizeError(error)};
        }
    }
    return results;
}
