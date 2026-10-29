import type {NavigationNode} from '@ytsaurus/components';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {isTableNode} from '../../../../utils/navigation/isTableNode';

export type QueryNavigationNode = Pick<NavigationNode, 'path' | 'type' | 'dynamic'>;

export function getNavigationQueryEngines(node: QueryNavigationNode): QueryEngine[] {
    if (!isTableNode(node.type)) return [];
    const engines = [QueryEngine.YQL, QueryEngine.CHYT, QueryEngine.SPYT];
    return node.dynamic ? [QueryEngine.YT_QL, ...engines] : engines;
}
