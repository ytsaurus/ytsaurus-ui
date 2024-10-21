import React, {FC} from 'react';
import {GraphCanvas, Graph as GraphProps, GraphState} from '@gravity-ui/graph';
import {GraphDetailBlock} from './GraphDetailBlock';
import {NodeTBlock} from './canvas/NodeBlock';
import './Graph.scss';
import cn from 'bem-cn-lite';

const b = cn('yt-graph');

type Props = {
    graphEditor: GraphProps;
};

export const Graph: FC<Props> = ({graphEditor}) => {
    if (!graphEditor) return null;

    return (
        <GraphCanvas
            graph={graphEditor}
            renderBlock={(graph, block) => {
                return <GraphDetailBlock graph={graph} block={block as unknown as NodeTBlock} />;
            }}
            onStateChanged={({state}) => {
                if (state === GraphState.ATTACHED) {
                    graphEditor.start();
                }
            }}
            className={b()}
        />
    );
};
