import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import forEach_ from 'lodash/forEach';

import {Graph, TConnection} from '@gravity-ui/graph';
import {Flex} from '@gravity-ui/uikit';

import {FlowComputation, FlowStream} from '../../../../../../shared/yt-types';

import {useUpdater} from '../../../../../hooks/use-updater';
import Yson from '../../../../../components/Yson/Yson';
import {
    YTGrapCanvasBlock,
    YTGraph,
    YTGraphBlock,
    YTGraphData,
    useConfig,
    useElkLayout,
} from '../../../../../components/YTGraph';
import {NoContent} from '../../../../../components/NoContent/NoContent';

import {loadFlowGraph} from '../../../../../store/actions/flow/graph';
import {getFlowGraphData} from '../../../../../store/selectors/flow/graph';

import {Computation} from './renderers/Computation';
import {Stream} from './renderers/Stream';

import './FlowGraph.scss';
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';

const block = cn('yt-flow-graph');

export function FlowGraph({pipeline_path, yson}: {pipeline_path: string; yson: boolean}) {
    const dispatch = useDispatch();
    const updateFn = React.useCallback(() => {
        dispatch(loadFlowGraph(pipeline_path));
    }, [pipeline_path, dispatch]);
    useUpdater(updateFn);

    const data = useSelector(getFlowGraphData);

    return (
        <div className={block()}>
            {yson ? <Yson value={data} folding virtualized /> : <FlowGraphImpl />}
        </div>
    );
}

export type FlowGraphBlock =
    | YTGraphBlock<'computation', FlowComputation>
    | YTGraphBlock<'stream', FlowStream>;

export type FlowGraphBlockItem<T extends FlowGraphBlock['is']> = FlowGraphBlock & {is: T};

export function FlowGraphImpl() {
    const config = useConfig<FlowGraphBlock>({
        computation: ComputationCanvasBlock,
        stream: YTGrapCanvasBlock,
    } as any);

    const {isEmpty, data} = useFlowGraphData();

    if (isEmpty) {
        return <NoContent warning="The graph is empty" />;
    }

    return (
        <YTGraph
            className={block('graph')}
            {...config}
            data={data}
            renderBlock={({className, style, graph, data}) => {
                return (
                    <Flex className={block('item-container', className)} style={style}>
                        {renderContent(graph, data)}
                    </Flex>
                );
            }}
        />
    );
}

function renderContent(graph: Graph, data: FlowGraphBlock) {
    switch (data.is) {
        case 'computation':
            return <Computation className={block('item')} graph={graph} item={data} />;
        case 'stream':
            return <Stream className={block('item')} graph={graph} item={data} />;
    }
    return null;
}

function useFlowGraphData() {
    const loadedData = useSelector(getFlowGraphData);
    const {computations = {}} = loadedData ?? {};

    const data: YTGraphData<FlowGraphBlock, TConnection> = React.useMemo(() => {
        return Object.keys(computations).reduce(
            (acc, key) => {
                const computation = computations[key];
                const block: (typeof acc)['blocks'][number] = makeBlock(
                    'computation',
                    computation,
                    {width: 240, height: 108},
                );
                acc.blocks.push(block);

                function collectStreams<T>(
                    streams: Record<string, FlowStream>,
                    type: T,
                    isInput: boolean,
                    size?: {width: number; height: number},
                ) {
                    forEach_(streams, (item) => {
                        acc.blocks.push(
                            makeBlock('stream', item, size ?? {width: 136, height: 70}),
                        );

                        const sourceBlockId = isInput ? item.id : computation.id;
                        const targetBlockId = isInput ? computation.id : item.id;
                        acc.connections.push({
                            sourceBlockId,
                            targetBlockId,
                            ...{points: []},
                            label: type as string,
                        });
                    });
                }

                collectStreams(computation.input_streams, 'input_stream', true);
                collectStreams(computation.source_streams, 'source_stream', true);
                collectStreams(computation.output_streams, 'output_stream', false);
                collectStreams(computation.sink_streams, 'sink_stream', false, {
                    width: 70,
                    height: 70,
                });

                return acc;
            },
            {
                blocks: [],
                connections: [],
            } as typeof data,
        );
    }, [computations]);

    return {
        isEmpty: !data.blocks.length,
        ...useElkLayout(data),
    };
}

function makeBlock<T extends string, D extends {id: string}>(
    type: T,
    item: D,
    size: {width: number; height: number},
) {
    return {
        id: item.id,
        is: type,
        name: item.id,
        x: NaN,
        y: NaN,
        selected: false,
        anchors: [],
        ...size,
        meta: item,
    };
}
