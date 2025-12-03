import {ProcessedNode} from '../utils';
import {parseTablePath} from './tables';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {buildOperationUrl} from '../../QueryResults/helpers/buildOperationUrl';
import {getOperationUrl} from '../../QueryResults/helpers/getOperationUrl';

export const preparePlanNode = (
    node: ProcessedNode,
    operationIdToCluster: Map<string, string>,
): ProcessedNode => {
    if (node.type === 'in' || node.type === 'out') {
        const table = parseTablePath(node.title ?? '');
        if (table) {
            node.url = genNavigationUrl({cluster: table.cluster, path: table.path});
        }
        return node;
    }

    if (node.progress?.remoteId) {
        const id = node.progress.remoteId.split('/').pop();

        if (!id) {
            node.url = getOperationUrl(node);
            return node;
        }

        const cluster = operationIdToCluster.has(id)
            ? operationIdToCluster.get(id)
            : node.progress?.remoteData?.cluster_name;

        if (cluster) {
            node.url = buildOperationUrl(cluster, id);
        }
    }

    return node;
};
