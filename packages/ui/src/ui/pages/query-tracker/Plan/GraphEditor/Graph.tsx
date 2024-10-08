import React, {FC} from 'react';
import {GraphCanvas, Graph as GraphProps} from '@gravity-ui/graph';
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
            renderBlock={() => {
                return <></>;
            }}
            className={b()}
        />
    );
};
