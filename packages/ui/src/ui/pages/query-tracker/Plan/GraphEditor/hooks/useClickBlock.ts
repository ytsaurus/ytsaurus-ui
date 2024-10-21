import {useEffect, useState} from 'react';
import {Graph} from '@gravity-ui/graph';
import {NodeBlock} from '../canvas/NodeBlock';

export function useClickBlock(graph: Graph) {
    const [block, setBlock] = useState<NodeBlock | undefined>(undefined);

    useEffect(() => {
        return graph.on('click', (event) => {
            setBlock(event.detail.target instanceof NodeBlock ? event.detail.target : undefined);
        });
    }, [graph, setBlock]);

    return block;
}
