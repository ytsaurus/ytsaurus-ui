import React, {FC} from 'react';
import {useGraphColors} from '../../GraphColors';
import {drawRunningIcon} from '../../utils';
import {NodeProgress, NodeState} from '../../models/plan';

type Props = {
    state: NodeState | 'NotStarted';
    progress: NodeProgress | undefined;
    className?: string;
};

export const NodeStatusIcon: FC<Props> = ({state, progress, className}) => {
    const colors = useGraphColors();
    if (state === 'InProgress') {
        return <img className={className} src={drawRunningIcon(progress, colors)} />;
    }
    return <div className={className} />;
};
