import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import partition_ from 'lodash/partition';

import {ECameraScaleLevel, TAnchor, TBlock, TBlockId, TConnection} from '@gravity-ui/graph';
import {Flex} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {
    FlowComputation,
    FlowComputationStreamType,
    FlowSink,
    FlowStream,
} from '../../../../../shared/yt-types';

import ClockIcon from '@gravity-ui/icons/svgs/clock.svg';
import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';
import ReceiptIcon from '@gravity-ui/icons/svgs/receipt.svg';

import Yson from '../../../../components/Yson/Yson';
import {
    YTGraph,
    YTGraphBlock,
    YTGraphData,
    useConfig,
    useElkLayout,
    useGraphScale,
} from '../../../../components/YTGraph';
import Loader from '../../../../components/Loader/Loader';
import {NoContent} from '../../../../components/NoContent/NoContent';
import {YTErrorBlock} from '../../../../components/Error/Error';

import {getCluster} from '../../../../store/selectors/global/cluster';

import {useFlowExecuteQuery} from '../../../../store/api/yt';

import {Computation} from './renderers/Computation';
import {Stream} from './renderers/Stream';
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';
import {StreamCanvasBlock} from './renderers/StreamCanvas';

import './FlowGraph.scss';
import {FlowGroupBlock} from './utils/FlowGroupBlock';
import {ComputationGroupCanvasBlock} from './renderers/ComputationGroupCanvas';
import {Sink} from './renderers/Sink';
import {FlowMessages, STATUS_TO_BG_THEME} from './renderers/FlowGraphRenderer';
import {SinkCanvasBlock} from './renderers/SinkCanvas';

const block = cn('yt-flow-graph');

export function FlowGraph({yson, pipeline_path}: {pipeline_path: string; yson: boolean}) {
    const {error, data, isLoading} = useFlowGraphLoadedData({pipeline_path});

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <YTErrorBlock error={error} />;
    }

    return (
        <div className={block()}>
            {yson ? (
                <Yson value={data} folding virtualized />
            ) : (
                <FlowGraphImpl pipeline_path={pipeline_path} />
            )}
        </div>
    );
}

export type FlowGraphBlock =
    | (YTGraphBlock<'computation-group', FlowComputation> & {stream_type?: never})
    | (YTGraphBlock<'computation', FlowComputation> & {stream_type?: never})
    | (YTGraphBlock<'stream', FlowStream> & {
          icon?: SVGIconSvgrData;
          stream_type?: FlowComputationStreamType;
      })
    | (YTGraphBlock<'sink', FlowSink> & {icon?: SVGIconSvgrData; stream_type?: never});

export type FlowGraphBlockItem<T extends FlowGraphBlock['is']> = FlowGraphBlock & {is: T};

export function FlowGraphImpl({pipeline_path}: {pipeline_path: string}) {
    const {scale, setScale} = useGraphScale();
    const useGroups = scale === ECameraScaleLevel.Minimalistic;

    const config = useConfig<FlowGraphBlock>(
        {
            computation: ComputationCanvasBlock,
            stream: StreamCanvasBlock,
            'computation-group': ComputationGroupCanvasBlock,
            sink: SinkCanvasBlock,
        },
        {useDefaultConnection: !useGroups},
    );

    const {isEmpty, isLoading, data, groups, groupBlocks, messages} = useFlowGraphData({
        pipeline_path,
    });

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (isEmpty) {
        return <NoContent warning="The graph is empty" />;
    }

    return (
        <div className={block()}>
            <div className={block('graph-messages')}>
                <FlowMessages data={messages} />
            </div>
            <YTGraph
                className={block('graph')}
                setScale={setScale}
                {...config}
                data={useGroups ? groups : data}
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
                customGroups={groupBlocks}
            />
        </div>
    );
}

function renderContent({item, ...rest}: {item: FlowGraphBlock; detailed?: boolean}) {
    switch (item.is) {
        case 'computation':
            return <Computation className={block('item')} item={item} {...rest} />;
        case 'stream':
            return <Stream className={block('item')} item={item} {...rest} />;
        case 'computation-group':
            return <Computation className={block('item')} item={item} {...rest} />;
        case 'sink':
            return <Sink className={block('item')} item={item} {...rest} />;
    }
}

const ICON_BY_TYPE: Record<
    FlowComputationStreamType,
    Pick<FlowGraphBlockItem<'stream'>, 'icon'>
> = {
    input_streams: {icon: FileCodeIcon},
    output_streams: {icon: FileCodeIcon},
    source_streams: {icon: FileCodeIcon},
    timer_streams: {icon: ClockIcon},
};

const COMPUTATION_SIZE = {width: 320, height: 130};
const STREAM_SIZE = {width: 240, height: 100};
const SINK_SIZE = {width: 200, height: 80};

function useFlowGraphLoadedData({pipeline_path}: {pipeline_path: string}) {
    const cluster = useSelector(getCluster);
    return useFlowExecuteQuery({
        cluster,
        parameters: {pipeline_path, flow_command: 'describe-pipeline'},
    });
}

function useFlowGraphData(params: {pipeline_path: string}) {
    const {data: loadedData} = useFlowGraphLoadedData(params);

    type FlowData = YTGraphData<FlowGraphBlock, TConnection>;

    const data: {data: FlowData; groups: FlowData; groupById: Map<string, FlowGroupBlock>} =
        React.useMemo(() => {
            const {computations = {}, streams = {}, sinks = {}, sources = {}} = loadedData ?? {};

            const res: typeof data = {
                data: {blocks: [], connections: []},
                groups: {blocks: [], connections: []},
                groupById: new Map<string, FlowGroupBlock>(),
            };

            const blockById: Map<TBlockId, FlowGraphBlock> = new Map();

            function addConnection<AnthorType extends string>(
                connections: FlowData['connections'],
                sourceBlockId: string,
                targetBlockId: string,
                {anchorType}: {anchorType?: AnthorType} = {},
            ) {
                const c: (typeof connections)[number] = {sourceBlockId, targetBlockId};
                connections.push(c);
                if (anchorType) {
                    const src = blockById.get(sourceBlockId)!;
                    const dst = blockById.get(targetBlockId)!;

                    makeTimerAnchors(anchorType, src, dst, c);
                }
            }

            // Collect streams
            Object.values(streams).forEach((stream) => {
                const streamBlock = makeBlock('stream', stream, {
                    name: stream.name,
                    ...STREAM_SIZE,
                });

                blockById.set(streamBlock.id, streamBlock);
                res.data.blocks.push(streamBlock);
            });

            // Collect computations and their groups
            Object.entries(computations).forEach(([name, computation]) => {
                const groupId = `\n\n__group(${computation.id})__\n\n`;

                const groupBlock = new FlowGroupBlock({
                    id: groupId,
                    computation,
                    streamSize: STREAM_SIZE,
                    computationSize: COMPUTATION_SIZE,
                    backgroundTheme: STATUS_TO_BG_THEME[computation.status],
                });

                res.groups.blocks.push(groupBlock);
                res.groupById.set(groupId, groupBlock);

                const computationBlock: (typeof res)['data']['blocks'][number] = makeBlock(
                    'computation',
                    computation,
                    {
                        name,
                        groupId,
                        backgroundTheme: STATUS_TO_BG_THEME[computation.status],
                        ...COMPUTATION_SIZE,
                    },
                );
                blockById.set(computationBlock.id, computationBlock);
                res.data.blocks.push(computationBlock);

                function collectStreams<K extends FlowComputationStreamType>(
                    key: K,
                    options?: {groupId: string},
                ) {
                    const streams = computation[key] ?? [];

                    streams.forEach((id) => {
                        if (key === 'input_streams' || key === 'source_streams') {
                            addConnection(res.data.connections, id, computation.id);
                        } else if (key === 'output_streams') {
                            addConnection(res.data.connections, computation.id, id);
                        } else if (key === 'timer_streams') {
                            addConnection(res.data.connections, computation.id, id, {
                                anchorType: key,
                            });
                            addConnection(res.data.connections, id, computation.id, {
                                anchorType: key,
                            });
                        }

                        if (options?.groupId) {
                            Object.assign(blockById.get(id)!, {
                                stream_type: key,
                                ...options,
                                ...ICON_BY_TYPE[key],
                            });
                        }
                    });
                }

                collectStreams('input_streams');
                collectStreams('output_streams', {groupId});
                collectStreams('source_streams', {groupId});
                collectStreams('timer_streams', {groupId});
            });

            // Collect sinks
            Object.entries(sinks).forEach(([_key, item]) => {
                const sink = makeBlock('sink', item, {...SINK_SIZE, icon: ReceiptIcon});
                addConnection(res.data.connections, item.stream_id, item.id);
                blockById.set(sink.id, sink);

                res.data.blocks.push(sink);
                res.groups.blocks.push(sink);
            });

            // Collect sources
            Object.entries(sources).forEach(([_key, item]) => {
                const source = makeBlock('sink', item, {...SINK_SIZE, icon: FileCodeIcon});
                addConnection(res.data.connections, item.id, item.stream_id);
                blockById.set(item.id, source);

                res.data.blocks.push(source);
                res.groups.blocks.push(source);
            });

            // Transform connections to group connections
            const connectionIds = new Set<string>();
            res.data.connections.forEach((item) => {
                const {sourceBlockId, targetBlockId} = item;
                const src = blockById.get(sourceBlockId)!;
                const dst = blockById.get(targetBlockId)!;

                let source: string | undefined;
                let target: string | undefined;

                if (src.groupId && dst.groupId) {
                    if (src.groupId !== dst.groupId) {
                        source = src.groupId;
                        target = dst.groupId;
                    }
                } else if (src.groupId) {
                    source = src.groupId;
                    target = dst.id;
                } else if (dst.groupId) {
                    source = src.id;
                    target = dst.groupId;
                }

                if (source && target) {
                    const id = `_${source}->${target}_`;
                    if (!connectionIds.has(id)) {
                        connectionIds.add(id);
                        addConnection(res.groups.connections, source, target);
                    }
                }
            });

            return res;
        }, [loadedData]);

    const elkRes = useElkLayout(data.groups);
    const res = React.useMemo(() => {
        const {blocks, connections} = elkRes.data;

        blocks.forEach(({id, x, y}) => {
            const group = data.groupById.get(id);
            if (group) {
                Object.assign(group, {x, y});
            }
        });

        const [_groups, other] = partition_(blocks, ({is}) => is === 'computation-group');

        return {
            data: {
                blocks: [
                    ...data.data.blocks.map((item) => {
                        const group = data.groupById.get(item.groupId!);
                        if (!group) {
                            return item;
                        }

                        if (item.is === 'computation') {
                            return group.updateBlockPosition('computation', item);
                        }

                        if (item.stream_type) {
                            return group.updateBlockPosition(item.stream_type, item);
                        }
                        return item;
                    }),
                    ...other,
                ],
                connections: data.data.connections,
            },
            groups: {
                blocks,
                connections,
            },
            groupBlocks: blocks.filter(({is}) => is === 'computation-group'),
        };
    }, [elkRes.isLoading, elkRes.data, data]);

    return {
        isEmpty: !data.data.blocks.length,
        ...elkRes,
        ...res,
        messages: loadedData?.messages,
    };
}

function makeBlock<
    T extends FlowGraphBlock['is'],
    D extends FlowGraphBlockItem<T>,
    O extends Partial<D>,
>(type: T, item: D['meta'], options: O) {
    return {
        id: item.id,
        is: type,
        name: item.id,
        selected: false,
        anchors: [],
        ...options,
        meta: item,
        // the values should be overriden by layout process
        x: 0,
        y: 0,
    };
}

function makeTimerAnchors<T extends string>(type: T, src: TBlock, dst: TBlock, c: TConnection) {
    const srcAnchor: TAnchor = {
        id: `anchor:out:${src.id as string}:${dst.id as string}:`,
        blockId: src.id,
        type,
    };
    const dstAnchor: TAnchor = {
        id: `anchor:in:${src.id as string}:${dst.id as string}:`,
        blockId: dst.id,
        type,
    };

    src.anchors.push({...srcAnchor, index: src.anchors.length});
    dst.anchors.push({...dstAnchor, index: dst.anchors.length});

    c.targetAnchorId = dstAnchor.id;
    c.sourceAnchorId = srcAnchor.id;
}
