import {type ProcessedNode} from '../utils';
import {parseTablePath} from './tables';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {buildOperationUrl} from '../../QueryResults/helpers/buildOperationUrl';
import {getOperationUrl} from '../../QueryResults/helpers/getOperationUrl';

export const preparePlanNode = (
    draftNode: ProcessedNode,
    operationIdToCluster: Map<string, string>,
): ProcessedNode => {
    if (draftNode.type === 'in' || draftNode.type === 'out') {
        const table = parseTablePath(draftNode.title ?? '');
        if (table) {
            draftNode.url = genNavigationUrl({cluster: table.cluster, path: table.path});
        }
        return draftNode;
    }

    if (draftNode.progress?.remoteId) {
        const id = draftNode.progress.remoteId.split('/').pop();

        if (!id) {
            draftNode.url = getOperationUrl(draftNode);
            return draftNode;
        }

        const cluster = operationIdToCluster.has(id)
            ? operationIdToCluster.get(id)
            : draftNode.progress?.remoteData?.cluster_name;

        if (cluster) {
            draftNode.url = buildOperationUrl(cluster, id);
        }
    }

    return draftNode;
};
