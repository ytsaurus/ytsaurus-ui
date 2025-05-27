import React from 'react';
import cn from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {loadFlowGraph} from '../../../../../store/actions/flow/graph';
import {useUpdater} from '../../../../../hooks/use-updater';

const block = cn('yt-flow-graph');

export function FlowGraph({pipeline_path}: {pipeline_path: string}) {
    const dispatch = useDispatch();
    const updateFn = React.useCallback(() => {
        dispatch(loadFlowGraph(pipeline_path));
    }, [pipeline_path, dispatch]);
    useUpdater(updateFn);

    return <div className={block()}>flow graph</div>;
}
