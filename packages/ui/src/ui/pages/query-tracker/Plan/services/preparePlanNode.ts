import {type ProcessedNode} from '../utils';
import {parseTablePath} from './tables';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {getOperationPageUrlFromNodeProgress} from './getOperationPageUrlFromNodeProgress';

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

    node.url = getOperationPageUrlFromNodeProgress(node.progress, operationIdToCluster);

    return node;
};
