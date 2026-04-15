import type {NodeProgress} from '../models/plan';
import {buildOperationUrl} from '../../QueryResults/helpers/buildOperationUrl';

export function getOperationPageUrlFromNodeProgress(
    nodeProgress?: NodeProgress,
): string | undefined {
    const remoteId = nodeProgress?.remoteId;
    if (!remoteId) return undefined;

    const operationId = remoteId.split('/').pop();
    if (!operationId) return undefined;

    const cluster = nodeProgress?.remoteData?.cluster_name ?? remoteId.split('/')[0];
    if (!cluster) return undefined;

    return buildOperationUrl(cluster, operationId);
}
