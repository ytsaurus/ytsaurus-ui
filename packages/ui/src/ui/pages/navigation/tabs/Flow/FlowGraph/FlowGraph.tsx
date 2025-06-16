import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {TConnection} from '@gravity-ui/graph';
import {Flex} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {
    FlowComputation,
    FlowComputationStreamType,
    FlowStream,
} from '../../../../../../shared/yt-types';

import ClockIcon from '@gravity-ui/icons/svgs/clock.svg';
import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';
import ReceiptIcon from '@gravity-ui/icons/svgs/receipt.svg';

import {useUpdater} from '../../../../../hooks/use-updater';
import Yson from '../../../../../components/Yson/Yson';
import {
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
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';
import {StreamCanvasBlock} from './renderers/StreamCanvas';

import './FlowGraph.scss';

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
    | (YTGraphBlock<'stream', FlowStream> & {icon?: SVGIconSvgrData});

export type FlowGraphBlockItem<T extends FlowGraphBlock['is']> = FlowGraphBlock & {is: T};

export function FlowGraphImpl() {
    const config = useConfig<FlowGraphBlock>({
        computation: ComputationCanvasBlock,
        stream: StreamCanvasBlock,
    });

    const {isEmpty, data} = useFlowGraphData();

    if (isEmpty) {
        return <NoContent warning="The graph is empty" />;
    }

    return (
        <YTGraph
            className={block('graph')}
            {...config}
            data={data}
            renderBlock={({className, style, data}) => {
                return (
                    <Flex className={block('item-container', className)} style={style}>
                        {renderContent({item: data})}
                    </Flex>
                );
            }}
            renderPopup={({data}) => {
                return (
                    <div className={block('item-popup', {type: data.is})}>
                        {renderContent({item: data, detailed: true})}
                    </div>
                );
            }}
            hasGroups
        />
    );
}

function renderContent({item, ...rest}: {item: FlowGraphBlock; detailed?: boolean}) {
    switch (item.is) {
        case 'computation':
            return <Computation className={block('item')} item={item} {...rest} />;
        case 'stream':
            return <Stream className={block('item')} item={item} {...rest} />;
    }
}

const ICON_BY_TYPE: Record<
    FlowComputationStreamType,
    Pick<FlowGraphBlockItem<'stream'>, 'icon'>
> = {
    input_streams: {icon: FileCodeIcon},
    output_streams: {icon: FileCodeIcon},
    source_streams: {icon: FileCodeIcon},
    sink_streams: {icon: ReceiptIcon},
    timer_streams: {icon: ClockIcon},
};

function useFlowGraphData() {
    const loadedData = useSelector(getFlowGraphData);

    const data: YTGraphData<FlowGraphBlock, TConnection> = React.useMemo(() => {
        const {computations = {}, streams = {}} = loadedData ?? {};

        const res: typeof data = {blocks: [], connections: []};

        const blockOptionsById: Map<string, {type: FlowComputationStreamType; groupId?: string}> =
            new Map();

        Object.entries(computations).forEach(([name, computation]) => {
            const groupId = `group(${computation.id})`;

            const block: (typeof res)['blocks'][number] = makeBlock('computation', computation, {
                name,
                width: 240,
                height: 108,
                groupId,
            });
            res.blocks.push(block);

            function addConnection(sourceBlockId: string, targetBlockId: string) {
                res.connections.push({sourceBlockId, targetBlockId, ...{points: []}});
            }

            function collectStreams<K extends FlowComputationStreamType>(key: K) {
                const streams = computation[key] ?? [];

                streams.forEach((id) => {
                    blockOptionsById.set(id, {
                        type: key,
                        groupId:
                            key !== 'input_streams' && key !== 'output_streams'
                                ? groupId
                                : undefined,
                    });
                    const isInput =
                        key === 'input_streams' ||
                        key === 'source_streams' ||
                        key === 'timer_streams';

                    if (isInput) {
                        addConnection(id, computation.id);
                    } else {
                        addConnection(computation.id, id);
                    }

                    if (key === 'timer_streams') {
                        addConnection(computation.id, id);
                    }
                });
            }

            collectStreams('input_streams');
            collectStreams('output_streams');
            collectStreams('source_streams');
            collectStreams('sink_streams');
            collectStreams('timer_streams');
        });

        Object.values(streams).forEach((stream) => {
            const {type, ...rest} = blockOptionsById.get(stream.id) ?? {};
            const options = ICON_BY_TYPE[type!];
            res.blocks.push(
                makeBlock('stream', stream, {
                    width: 136,
                    height: 70,
                    name: stream.name,
                    ...options,
                    ...rest,
                }),
            );
        });

        return res;
    }, [loadedData]);

    return {
        isEmpty: !data.blocks.length,
        ...useElkLayout(data),
    };
}

function makeBlock<T extends FlowGraphBlock['is'], D extends FlowGraphBlockItem<T>>(
    type: T,
    item: D['meta'],
    options?: Partial<D>,
) {
    return {
        id: item.id,
        is: type,
        name: item.id,
        x: NaN,
        y: NaN,
        selected: false,
        anchors: [],
        width: 136,
        height: 70,
        ...options,
        meta: item,
    };
}
