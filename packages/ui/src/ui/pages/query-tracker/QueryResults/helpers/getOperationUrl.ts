import {ProcessedNode} from '../../Plan/utils';
import {buildOperationUrl} from './buildOperationUrl';

export const getOperationUrl = (node: ProcessedNode) => {
    const remoteId = node.progress?.remoteId;
    if (!remoteId) {
        return undefined;
    }
    const idParts = remoteId.split('/');
    const cluster = idParts[0];
    const clusterName = cluster.split('.')[0];
    const url = buildOperationUrl(clusterName, idParts[1], idParts[2]);
    return url ? url : undefined;
};
