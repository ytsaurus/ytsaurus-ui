import React, {FC} from 'react';
import {Graph, GraphBlock} from '@gravity-ui/graph';
import {NodeTBlock} from './canvas/NodeBlock';
import cn from 'bem-cn-lite';
import './GraphDetailBlock.scss';
import {DetailBlock} from './DetailBlock';

const b = cn('yt-graph-detail-block');

type Props = {
    graph: Graph;
    block: NodeTBlock;
};

export const GraphDetailBlock: FC<Props> = ({graph, block}) => {
    return (
        <GraphBlock graph={graph} block={block} containerClassName={b()}>
            <DetailBlock block={block} showHeader />
        </GraphBlock>
    );
};
