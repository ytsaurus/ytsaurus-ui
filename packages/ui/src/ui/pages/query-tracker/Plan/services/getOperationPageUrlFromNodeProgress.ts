import type {NodeProgress} from '../models/plan';
import {buildOperationUrl} from '../../QueryResults/helpers/buildOperationUrl';

export function getOperationPageUrlFromNodeProgress(
    nodeProgress?: NodeProgress,
    operationIdToCluster?: ReadonlyMap<string, string>,
): string | undefined {
    const operationReference = nodeProgress?.remoteId || nodeProgress?.waitingRemoteId;
    if (!operationReference) return undefined;

    const idParts = operationReference.split('/');
    const operationId = idParts[idParts.length - 1];
    if (!operationId) return undefined;

    const cluster =
        operationIdToCluster?.get(operationId) ??
        nodeProgress?.remoteData?.cluster_name ??
        (idParts.length > 1 ? idParts[0] : undefined);
    if (!cluster) return undefined;

    return buildOperationUrl(cluster, operationId);
}
