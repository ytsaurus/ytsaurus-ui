import {ECameraScaleLevel, Graph, type TBlockId, type TConnection} from '@gravity-ui/graph';
import {GraphBlock, useGraphEvents} from '@gravity-ui/graph/react';
import ClockIcon from '@gravity-ui/icons/svgs/clock.svg';
import FileCodeIcon from '@gravity-ui/icons/svgs/file-code.svg';
import ReceiptIcon from '@gravity-ui/icons/svgs/receipt.svg';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import partition_ from 'lodash/partition';
import React from 'react';
import {
    type FlowComputationStreamType,
    type FlowSink,
    type FlowStream,
} from '../../../../../shared/yt-types';
import Loader from '../../../../components/Loader/Loader';
import {NoContent} from '../../../../components/NoContent';
import Select from '../../../../components/Select/Select';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {
    useConfig,
    useElkLayout,
    useGraphScale,
    YTGraph,
    type YTGraphBlock,
    type YTGraphData,
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
import {type SVGIconSvgrData} from '../../../../types/uikit';
import {type FlowComputationRuntimeType} from '../types';
import './FlowGraph.scss';
import i18n from './i18n';
import {Computation} from './renderers/Computation';
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';
import {ComputationGroupCanvasBlock} from './renderers/ComputationGroupCanvas';
import {FlowGraphAnchors} from './renderers/FlowGraphAnchors/FlowGraphAnchors';
import {STATUS_TO_BG_THEME} from './renderers/FlowGraphRenderer';
import {Sink} from './renderers/Sink';
import {SinkCanvasBlock} from './renderers/SinkCanvas';
import {Stream} from './renderers/Stream';
import {StreamCanvasBlock} from './renderers/StreamCanvas';
import {FlowGroupBlock} from './utils/FlowGroupBlock';
import {
    addComputationInOut,
    addFlowConnection,
    applyConnectionStyle,
    makeBlock,
    makeFlowComputationRuntimeData,
    makeTimerAnchors,
} from './utils/utils';

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
    | (YTGraphBlock<'computation-group', FlowComputationRuntimeType> & {stream_type?: never})
    | (YTGraphBlock<'computation', FlowComputationRuntimeType> & {stream_type?: never})
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

    const {isEmpty, isLoading, data, groups, groupBlocks} = useFlowGraphData({
        pipeline_path,
    });

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (isEmpty) {
        return <NoContent warning={i18n('alert_empty-graph')} />;
    }

    return (
        <div className={block()}>
            <FlowGraphToolbar blocks={data.blocks} zoomToNode={zoomTo} />
            <YTGraph
                className={block('graph')}
                setScale={setScale}
                {...config}
                data={useGroups && !zoomToState ? groups : data}
                renderBlock={({className, data, graph}) => {
                    return (
                        <GraphBlock graph={graph} block={data} className={block('graph-block')}>
                            <Flex className={block('item-container', className)}>
                                {renderContent({item: data})}
                            </Flex>
                            <FlowGraphAnchors graph={graph} data={data} />
                        </GraphBlock>
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
            />
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
                            label={i18n('field_zoom-to')}
                            placeholder={i18n('context_select-node')}
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
    return <ShowDataButton data={data} label={i18n('action_graph-data')} />;
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
    const cluster = useSelector(selectCluster);
    return useFlowExecuteQuery<'describe-pipeline'>({
        cluster,
        parameters: {pipeline_path, flow_command: 'describe-pipeline'},
    });
}

function useFlowGraphRuntimeData({pipeline_path}: {pipeline_path: string}) {
    const {data, ...rest} = useFlowGraphLoadedData({pipeline_path});

    const dataWithRuntime = React.useMemo(() => {
        if (!data) {
            return data;
        }

        const {computations, ...restLoadedData} = data;

        return {
            ...restLoadedData,
            computations: Object.entries(computations).reduce(
                (acc, [key, item]) => {
                    acc[key] = {
                        ...item,
                        runtimeData: makeFlowComputationRuntimeData(item),
                    };
                    return acc;
                },
                {} as Record<string, FlowComputationRuntimeType>,
            ),
        };
    }, [data]);

    return {
        data: dataWithRuntime,
        ...rest,
    };
}

function useFlowGraphData(params: {pipeline_path: string}) {
    const {data: loadedData} = useFlowGraphRuntimeData(params);

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

                const computationBlock: (typeof res)['data']['blocks'][number] = makeBlock(
                    'computation',
                    computation,
                    {
                        name: computation.name ?? computation.id,
                        groupId,
                        backgroundTheme: STATUS_TO_BG_THEME[computation.status],
                        ...COMPUTATION_SIZE,
                        anchors: [],
                    },
                );
                const {targetAnchorId, sourceAnchorId} = addComputationInOut(computationBlock);
                addComputationInOut(groupBlock);

                blockById.set(computationBlock.id, computationBlock);
                res.data.blocks.push(computationBlock);

                const {runtimeData} = computation;

                function collectStreams<K extends FlowComputationStreamType>(
                    key: K,
                    options?: {groupId: string},
                ) {
                    const streams = computation[key] ?? [];

                    streams.forEach((id) => {
                        if (key === 'input_streams' || key === 'source_streams') {
                            const c = addFlowConnection(res.data.connections, id, computation.id, {
                                targetAnchorId,
                            });
                            applyConnectionStyle(
                                c,
                                runtimeData.input.extendedStreams.get(id) ?? {},
                            );
                        } else if (key === 'output_streams') {
                            const c = addFlowConnection(res.data.connections, computation.id, id, {
                                sourceAnchorId,
                            });
                            applyConnectionStyle(
                                c,
                                runtimeData.output.extendedStreams.get(id) ?? {},
                            );
                        } else if (key === 'timer_streams') {
                            const computationBlock = blockById.get(computation.id)!;
                            const timerBlock = blockById.get(id)!;

                            const cOut = addFlowConnection(
                                res.data.connections,
                                computation.id,
                                id,
                                {sourceAnchorId},
                            );
                            makeTimerAnchors(computationBlock, timerBlock, cOut);
                            const timerInfo = runtimeData.timer.extendedStreams.get(id) ?? {};
                            applyConnectionStyle(cOut, timerInfo);

                            const cIn = addFlowConnection(
                                res.data.connections,
                                id,
                                computation.id,
                                {targetAnchorId},
                            );
                            makeTimerAnchors(timerBlock, computationBlock, cIn);
                            applyConnectionStyle(cIn, timerInfo);
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
                addFlowConnection(res.data.connections, item.stream_id, item.id);
                blockById.set(sink.id, sink);

                res.data.blocks.push(sink);
                res.groups.blocks.push(sink);
            });

            // Collect sources
            Object.entries(sources).forEach(([_key, item]) => {
                const source = makeBlock('sink', item, {...SINK_SIZE, icon: FileCodeIcon});
                addFlowConnection(res.data.connections, item.id, item.stream_id);
                blockById.set(item.id, source);

                res.data.blocks.push(source);
                res.groups.blocks.push(source);
            });

            // Transform connections to group connections
            const connectionById = new Map<string, (typeof res.data.connections)[number]>();
            res.data.connections.forEach((item) => {
                const {sourceBlockId, targetBlockId, styles} = item;
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

                    let c = connectionById.get(id);
                    if (c === undefined) {
                        c = addFlowConnection(res.groups.connections, source, target, {styles});
                        connectionById.set(id, c);
                    } else {
                        c.styles = Object.assign({}, c.styles, styles);
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
