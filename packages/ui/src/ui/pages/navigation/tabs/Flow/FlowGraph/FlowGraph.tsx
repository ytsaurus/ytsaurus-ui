import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {TBlockId, TConnection} from '@gravity-ui/graph';
import {Flex} from '@gravity-ui/uikit';
import {SVGIconSvgrData} from '@gravity-ui/uikit/build/esm/components/Icon/types';

import {
    FlowComputation,
    FlowComputationStreamType,
    FlowNodeStatus,
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
import {YTErrorBlock} from '../../../../../components/Error/Error';

import {loadFlowGraph} from '../../../../../store/actions/flow/graph';
import {getFlowGraphData, getFlowGraphError} from '../../../../../store/selectors/flow/graph';

import {Computation} from './renderers/Computation';
import {Stream} from './renderers/Stream';
import {ComputationCanvasBlock} from './renderers/ComputationCanvas';
import {StreamCanvasBlock} from './renderers/StreamCanvas';

import './FlowGraph.scss';
import {FlowGroupBlock} from './utils/FlowGroupBlock';
import {ComputationGroupCanvasBlock} from './renderers/ComputationGroupCanvas';

const block = cn('yt-flow-graph');

export function FlowGraph({pipeline_path, yson}: {pipeline_path: string; yson: boolean}) {
    const dispatch = useDispatch();
    const updateFn = React.useCallback(() => {
        dispatch(loadFlowGraph(pipeline_path));
    }, [pipeline_path, dispatch]);
    useUpdater(updateFn);

    const data = useSelector(getFlowGraphData);
    const error = useSelector(getFlowGraphError);

    if (error) {
        return <YTErrorBlock error={error} />;
    }

    return (
        <div className={block()}>
            {yson ? <Yson value={data} folding virtualized /> : <FlowGraphImpl />}
        </div>
    );
}

export type FlowGraphBlock =
    | (YTGraphBlock<'computation-group', FlowComputation> & {stream_type?: never})
    | (YTGraphBlock<'computation', FlowComputation> & {stream_type?: never})
    | (YTGraphBlock<'stream', FlowStream> & {
          icon?: SVGIconSvgrData;
          stream_type?: FlowComputationStreamType;
      });

export type FlowGraphBlockItem<T extends FlowGraphBlock['is']> = FlowGraphBlock & {is: T};

export function FlowGraphImpl() {
    const config = useConfig<FlowGraphBlock>(
        {
            computation: ComputationCanvasBlock,
            stream: StreamCanvasBlock,
            'computation-group': ComputationGroupCanvasBlock,
        },
        {useDefaultConncation: true},
    );

    const {isEmpty, data, groups, groupBlocks} = useFlowGraphData();

    if (isEmpty) {
        return <NoContent warning="The graph is empty" />;
    }

    return (
        <YTGraph
            className={block('graph')}
            {...config}
            data={config.scale === 100 ? groups : data}
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
    );
}

function renderContent({item, ...rest}: {item: FlowGraphBlock; detailed?: boolean}) {
    switch (item.is) {
        case 'computation':
            return <Computation className={block('item')} item={item} {...rest} />;
        case 'stream':
            return <Stream className={block('item')} item={item} {...rest} />;
        case 'computation-group':
            return <Computation className={block('item')} item={item as any} {...rest} />;
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

const STATUS_TO_BG_THEME: Partial<
    Record<FlowNodeStatus, 'success' | 'info' | 'warning' | 'danger'>
> = {
    warning: 'warning',
    alert: 'warning',
    error: 'danger',
    fatal: 'danger',
    maximum: 'danger',
};

const COMPUTATION_SIZE = {width: 240, height: 108};
const STREAM_SIZE = {width: 160, height: 84};

function useFlowGraphData() {
    const loadedData = useSelector(getFlowGraphData);

    type FlowData = YTGraphData<FlowGraphBlock, TConnection>;

    const data: {data: FlowData; groups: FlowData; groupById: Map<string, FlowGroupBlock>} =
        React.useMemo(() => {
            const {computations = {}, streams = {}} = loadedData ?? {};

            const res: typeof data = {
                data: {blocks: [], connections: []},
                groups: {blocks: [], connections: []},
                groupById: new Map<string, FlowGroupBlock>(),
            };

            const blockById: Map<TBlockId, FlowGraphBlock> = new Map();

            function addConnection(
                connections: FlowData['connections'],
                sourceBlockId: string,
                targetBlockId: string,
            ) {
                connections.push({sourceBlockId, targetBlockId, ...{points: []}});
            }

            Object.values(streams).forEach((stream) => {
                const streamBlock = makeBlock('stream', stream, {
                    name: stream.name,
                    ...STREAM_SIZE,
                });

                blockById.set(streamBlock.id, streamBlock);
                res.data.blocks.push(streamBlock);
            });

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

                const block: (typeof res)['data']['blocks'][number] = makeBlock(
                    'computation',
                    computation,
                    {
                        name,
                        groupId,
                        backgroundTheme: STATUS_TO_BG_THEME[computation.status],
                        ...COMPUTATION_SIZE,
                    },
                );
                blockById.set(block.id, block);
                res.data.blocks.push(block);

                function collectStreams<K extends FlowComputationStreamType>(
                    key: K,
                    options?: {groupId: string},
                ) {
                    const streams = computation[key] ?? [];

                    streams.forEach((id) => {
                        const isInput =
                            key === 'input_streams' ||
                            key === 'source_streams' ||
                            key === 'timer_streams';

                        if (isInput) {
                            addConnection(res.data.connections, id, computation.id);
                        } else {
                            addConnection(res.data.connections, computation.id, id);
                        }

                        if (key === 'timer_streams') {
                            addConnection(res.data.connections, computation.id, id);
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

            // Collect group connections
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
