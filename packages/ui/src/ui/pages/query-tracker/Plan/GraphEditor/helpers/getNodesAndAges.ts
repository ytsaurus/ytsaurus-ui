import {ProcessedGraph} from '../../utils';
import {ElkExtendedEdge} from 'elkjs/lib/elk-api';

export const getNodesAndAges = ({
    nodes,
    edges,
}: ProcessedGraph): {
    children: {id: string; level: number}[];
    edges: ElkExtendedEdge[];
} => {
    return {
        children: nodes.map((node) => ({
            id: node.id,
            level: node.level,
        })),
        edges: edges.map(({from, to}) => ({
            id: from + '/' + to,
            sources: [from],
            targets: [to],
        })),
    };
};
