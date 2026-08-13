import {type ProcessedNode} from '../utils';
import {parseTablePath} from './tables';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {buildOperationUrl} from '../../QueryResults/helpers/buildOperationUrl';
import {getOperationUrl} from '../../QueryResults/helpers/getOperationUrl';

export const preparePlanNode = (
    accNode: ProcessedNode,
    operationIdToCluster: Map<string, string>,
): ProcessedNode => {
    if (accNode.type === 'in' || accNode.type === 'out') {
        const table = parseTablePath(accNode.title ?? '');
        if (table) {
            accNode.url = genNavigationUrl({cluster: table.cluster, path: table.path});
        }
        return accNode;
    }

    if (accNode.progress?.remoteId) {
        const id = accNode.progress.remoteId.split('/').pop();

        if (!id) {
            accNode.url = getOperationUrl(accNode);
            return accNode;
        }

        const cluster = operationIdToCluster.has(id)
            ? operationIdToCluster.get(id)
            : accNode.progress?.remoteData?.cluster_name;

        if (cluster) {
            accNode.url = buildOperationUrl(cluster, id);
        }
    }

    return accNode;
};
