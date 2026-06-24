import React from 'react';
import cn from 'bem-cn-lite';
import partition_ from 'lodash/partition';

import {
    ECameraScaleLevel,
    type Graph,
    type TAnchor,
    type TBlock,
    type TBlockId,
    type TConnection,
} from '@gravity-ui/graph';
import ClockIcon from '@gravity-ui/icons/svgs/clock.svg';
import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';
import ReceiptIcon from '@gravity-ui/icons/svgs/receipt.svg';
import {Flex} from '@gravity-ui/uikit';

import {
    type FlowComputationStreamType,
    type FlowComputationType,
    type FlowSink,
    type FlowStream,
} from '../../../../../shared/yt-types';
import {type SVGIconSvgrData} from '../../../../types/uikit';

import Loader from '../../../../components/Loader/Loader';
import {NoContent} from '../../../../components/NoContent';
import Select from '../../../../components/Select/Select';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {
    YTGraph,
    type YTGraphBlock,
    type YTGraphData,
    useConfig,
    useElkLayout,
    useGraphScale,
} from '../../../../components/YTGraph';
import {FlowError} from '../../../../pages/flow/flow-components/FlowError/FlowError';
import {ShowDataButton} from '../../../../pages/flow/flow-components/FlowMeta/FlowMeta';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {filtersSlice} from '../../../../store/reducers/flow/filters';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectFlowPipelinePath,
    selectFlowZoomToNode,
} from '../../../../store/selectors/flow/filters';
import {selectCluster} from '../../../../store/selectors/global/cluster';

import {type FlowConnection, FlowConnectionPortal} from './FlowConnectionPortal';
import i18n from './i18n';
import {Computation} from './renderers/Computation';
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';
import {ComputationGroupCanvasBlock} from './renderers/ComputationGroupCanvas';
import {STATUS_TO_BG_THEME} from './renderers/FlowGraphRenderer';
import {Sink} from './renderers/Sink';
import {SinkCanvasBlock} from './renderers/SinkCanvas';
import {Stream} from './renderers/Stream';
import {StreamCanvasBlock} from './renderers/StreamCanvas';
import {FlowGroupBlock} from './utils/FlowGroupBlock';

import './FlowGraph.scss';

const block = cn('yt-flow-graph');

export function FlowGraph({pipeline_path}: {pipeline_path: string}) {
    const {error, isLoading} = useFlowGraphLoadedData({pipeline_path});

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    return (
        <div className={block()}>
            <FlowGraphImpl pipeline_path={pipeline_path} />
        </div>
    );
}

export type FlowGraphBlock =
    | (YTGraphBlock<'computation-group', FlowComputationType> & {stream_type?: never})
    | (YTGraphBlock<'computation', FlowComputationType> & {stream_type?: never})
    | (YTGraphBlock<'stream', FlowStream> & {
          icon?: SVGIconSvgrData;
          stream_type?: FlowComputationStreamType;
      })
    | (YTGraphBlock<'sink', FlowSink> & {icon?: SVGIconSvgrData; stream_type?: never});

export type FlowGraphBlockItem<T extends FlowGraphBlock['is']> = FlowGraphBlock & {is: T};

export function FlowGraphImpl({pipeline_path}: {pipeline_path: string}) {
    const {scale, setScale} = useGraphScale();
    const useGroups = scale === ECameraScaleLevel.Minimalistic;

    const zoomTo = useSelector(selectFlowZoomToNode);
    const [zoomToState, setZoomToState] = React.useState<string>();
    const [graphInstance, setGraphInstance] = React.useState<Graph | null>(null);
    React.useEffect(() => {
        setZoomToState(zoomTo);
    }, [zoomTo]);

    const config = useConfig<FlowGraphBlock>(
        {
            computation: ComputationCanvasBlock,
            stream: StreamCanvasBlock,
            'computation-group': ComputationGroupCanvasBlock,
            sink: SinkCanvasBlock,
        },
        {useDefaultConnection: !useGroups},
    );

    const {isEmpty, isLoading, data, groups, groupBlocks, blockById} = useFlowGraphData({
        pipeline_path,
    });

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (isEmpty) {
        return <NoContent warning="The graph is empty" />;
    }

    const activeData = useGroups && !zoomToState ? groups : data;

    return (
        <div className={block()}>
            <FlowGraphToolbar blocks={data.blocks} zoomToNode={zoomTo} />
            <YTGraph
                className={block('graph')}
                setScale={setScale}
                {...config}
                data={activeData}
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
                zoomToNode={zoomToState}
                onZoomToFinished={() => setZoomToState(undefined)}
                onGraph={setGraphInstance}
            />
            {graphInstance && (
                <FlowConnectionPortal
                    graph={graphInstance}
                    connections={activeData.connections as FlowConnection[]}
                    blockById={blockById}
                />
            )}
        </div>
    );
}

function FlowGraphToolbar({
    blocks,
    zoomToNode,
}: {
    blocks?: Array<FlowGraphBlock>;
    zoomToNode?: string;
}) {
    const dispatch = useDispatch();

    const items = React.useMemo(() => {
        return (
            blocks?.map((item) => {
                return {
                    value: item.id,
                    text: item.name,
                };
            }) ?? []
        );
    }, [blocks]);

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <Select
                            value={zoomToNode ? [zoomToNode] : []}
                            label="Zoom to:"
                            placeholder="Select a node..."
                            onUpdate={([zoomToNode = '']) => {
                                dispatch(filtersSlice.actions.updateFlowFilters({zoomToNode}));
                            }}
                            items={items}
                            hasClear
                        />
                    ),
                },
                {node: <FlowGraphDataButton />},
            ]}
        />
    );
}

function FlowGraphDataButton() {
    const pipeline_path = useSelector(selectFlowPipelinePath);
    const {data} = useFlowGraphLoadedData({pipeline_path});
    return <ShowDataButton data={data} label={i18n('graph-data')} />;
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

type FlowExtendedStream = {
    backpressure_detected?: boolean;
    drained?: boolean;
    stream_graph_entity_id?: string;
};

function useFlowGraphLoadedData({pipeline_path}: {pipeline_path: string}) {
    const cluster = useSelector(selectCluster);
    return useFlowExecuteQuery<'describe-pipeline'>({
        cluster,
        parameters: {pipeline_path, flow_command: 'describe-pipeline'},
    });
}

function useFlowGraphData(params: {pipeline_path: string}) {
    const {data: loadedData} = useFlowGraphLoadedData(params);

    type FlowData = YTGraphData<FlowGraphBlock, FlowConnection>;
    type RawGraphData = {
        data: FlowData;
        groups: FlowData;
        groupById: Map<string, FlowGroupBlock>;
    };

    const {rawGraphData} = React.useMemo(() => {
        const {computations = {}, streams = {}, sinks = {}, sources = {}} = loadedData ?? {};

        const res: RawGraphData = {
            data: {blocks: [], connections: []},
            groups: {blocks: [], connections: []},
            groupById: new Map<string, FlowGroupBlock>(),
        };

        const blockById: Map<TBlockId, FlowGraphBlock> = new Map();
        const portStateByStreamId = getPortStateByStreamId(Object.values(computations));

        function addConnection<AnchorType extends string>(
            connections: FlowData['connections'],
            sourceBlockId: string,
            targetBlockId: string,
            {
                anchorType,
                portState,
            }: {anchorType?: AnchorType; portState?: FlowConnection['portState']} = {},
        ) {
            const srcBlock = blockById.get(sourceBlockId);
            const dstBlock = blockById.get(targetBlockId);
            const streamBlockId =
                srcBlock?.is === 'stream'
                    ? sourceBlockId
                    : dstBlock?.is === 'stream'
                      ? targetBlockId
                      : undefined;

            const c: (typeof connections)[number] = {
                sourceBlockId,
                targetBlockId,
                streamBlockId,
                portState,
            };
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
        Object.entries(computations).forEach(([_name, computation]) => {
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

            const computationBlock: RawGraphData['data']['blocks'][number] = makeBlock(
                'computation',
                computation,
                {
                    name: computation.name ?? computation.id,
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
                    const portState = portStateByStreamId.get(id);

                    if (key === 'input_streams' || key === 'source_streams') {
                        addConnection(res.data.connections, id, computation.id, {portState});
                    } else if (key === 'output_streams') {
                        addConnection(res.data.connections, computation.id, id, {portState});
                    } else if (key === 'timer_streams') {
                        addConnection(res.data.connections, computation.id, id, {
                            anchorType: key,
                            portState,
                        });
                        addConnection(res.data.connections, id, computation.id, {
                            anchorType: key,
                            portState,
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
            const src = blockById.get(sourceBlockId!)!;
            const dst = blockById.get(targetBlockId!)!;

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

        return {rawGraphData: res, blockById};
    }, [loadedData]);

    const elkRes = useElkLayout(rawGraphData.groups);
    const res = React.useMemo(() => {
        const {blocks, connections} = elkRes.data;

        blocks.forEach(({id, x, y}) => {
            const group = rawGraphData.groupById.get(id);
            if (group) {
                Object.assign(group, {x, y});
            }
        });

        const [_groups, other] = partition_(blocks, ({is}) => is === 'computation-group');

        const layoutBlocks = [
            ...rawGraphData.data.blocks.map((item) => {
                const group = rawGraphData.groupById.get(item.groupId!);
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
        ];

        const finalBlockById = new Map<string, FlowGraphBlock>();
        layoutBlocks.forEach((b) => finalBlockById.set(b.id, b));

        return {
            data: {
                blocks: layoutBlocks,
                connections: rawGraphData.data.connections,
            },
            groups: {
                blocks,
                connections,
            },
            groupBlocks: blocks.filter(({is}) => is === 'computation-group'),
            blockById: finalBlockById,
        };
    }, [elkRes.isLoading, elkRes.data, rawGraphData]);

    return {
        isEmpty: !rawGraphData.data.blocks.length,
        ...elkRes,
        ...res,
        messages: loadedData?.messages,
    };
}

function getPortStateByStreamId(computations: Array<FlowComputationType>) {
    const res = new Map<string, FlowConnection['portState']>();
    const streamTypes: Array<FlowComputationStreamType> = [
        'input_streams',
        'output_streams',
        'source_streams',
        'timer_streams',
    ];

    computations.forEach((computation) => {
        streamTypes.forEach((key) => {
            getExtendedStreams(computation, key).forEach((item, id) => {
                const portState = getPortState(item);
                if (portState) {
                    res.set(id, portState);
                }
            });
        });
    });

    return res;
}

function getExtendedStreams(
    computation: FlowComputationType,
    key: FlowComputationStreamType,
): Map<string, FlowExtendedStream> {
    const extendedKey = `extended_${key}` as const;
    const extendedStreams = (computation as Record<string, unknown>)[extendedKey];

    if (!Array.isArray(extendedStreams)) {
        return new Map();
    }

    return new Map(
        extendedStreams
            .filter((item): item is FlowExtendedStream => Boolean(item?.stream_graph_entity_id))
            .map((item) => [item.stream_graph_entity_id!, item]),
    );
}

function getPortState(item?: FlowExtendedStream): FlowConnection['portState'] {
    if (item?.backpressure_detected) {
        return 'backpressure';
    }

    if (item?.drained) {
        return 'drain';
    }

    return undefined;
}

function makeBlock<
    T extends FlowGraphBlock['is'],
    D extends FlowGraphBlockItem<T>,
    O extends Partial<D>,
>(type: T, item: D['meta'], options: O) {
    return {
        id: item.id,
        is: type,
        name: item.name ?? item.id,
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

    src.anchors?.push({...srcAnchor, index: src.anchors.length});
    dst.anchors?.push({...dstAnchor, index: dst.anchors.length});

    c.targetAnchorId = dstAnchor.id;
    c.sourceAnchorId = srcAnchor.id;
}
