import * as React from 'react';

import {Button, Icon, Popup, PopupProps, Text, useVirtualElementRef} from '@gravity-ui/uikit';
import Loader from './components/Loader/Loader';

import {NodeDetails, NodeProgress} from './models/plan';
import {useUpdate} from 'react-use';
import ResizeObserver from 'resize-observer-polyfill';
import {DataSet} from 'vis-data';
import type {DataSetEdges, Network, Options, Position} from 'vis-network';

import {GraphColors, useGraphColors} from './GraphColors';
import OperationNodeInfo from './OperationNodeInfo';
import {LegendInfo} from './components/Legend/Legend';
import {Minimap} from './components/Minimap/Minimap';
import VisNetwork from './components/VisNetwork/VisNetwork';
import {
    OperationSchemas,
    ProcessedGraph,
    ProcessedNode,
    getConnectedEdges,
    getFullEdge,
    nodeHasInfo,
    prepareNodes,
    rafThrottle,
    updateColors,
    updateProgress,
} from './utils';

import {layoutGraph} from './services/layout';

import {openInNewTab} from '../../../utils/utils';

import cn from 'bem-cn-lite';

import minusIcon from '@gravity-ui/icons/svgs/minus.svg';
import plusIcon from '@gravity-ui/icons/svgs/plus.svg';
import fitIcon from '@gravity-ui/icons/svgs/target.svg';

import './Graph.scss';
import {useSelector} from '../../../store/redux-hooks';
import {getQuerySingleProgress} from '../../../store/selectors/query-tracker/query';

const block = cn('graph');
const showTooltipClass = `${block()}_show-tooltip`;

function useRef<T>(value: T) {
    const ref = React.useRef(value);
    ref.current = value;
    return ref;
}

interface GraphProps {
    isActive?: boolean;
    className?: string;
    graph: ProcessedGraph;
    showMinimap?: boolean;
    prepareNode?: (node: ProcessedNode) => ProcessedNode;
}

const redrawNetwork = rafThrottle((network?: Network, fit?: boolean) => {
    if (!network) {
        return;
    }
    if (fit) {
        network.redraw();
        network.fit();
    } else {
        const scale = network.getScale();
        network.redraw();
        network.moveTo({
            scale: scale,
        });
    }
});

export default function Graph({isActive, className, graph, showMinimap, prepareNode}: GraphProps) {
    const [network, setNetwork] = React.useState<Network>();
    const [graphContainer, setGraphContainer] = React.useState<HTMLDivElement | null>(null);
    const colors = useGraphColors();
    const options = useConfig(colors);
    const {yql_progress: progress} = useSelector(getQuerySingleProgress);
    const [nodes] = React.useState<DataSet<ProcessedNode>>(() => new DataSet());
    const [edges] = React.useState<DataSetEdges>(() => new DataSet());

    const [initialRender, setInitialRender] = React.useState(true);
    const repaint = useUpdate();
    const [error, setError] = React.useState<unknown>();

    const nodeInfoContainerRef = React.useRef<HTMLDivElement>(null);
    const [nodeInfo, setNodeInfo] = React.useState<{
        progress?: NodeProgress;
        details?: NodeDetails;
        schemas?: OperationSchemas;
        position: Position;
        placement: PopupProps['placement'];
    }>();
    const nodeInfoRef = useVirtualElementRef(
        nodeInfo ? {rect: {top: nodeInfo.position.y, left: nodeInfo.position.x}} : undefined,
    );

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!nodeInfoContainerRef.current?.contains(e.target as any)) {
                setNodeInfo(undefined);
            }
        };
        if (nodeInfo) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [nodeInfo]);

    const hoveredNodeRef = React.useRef<ProcessedNode>();

    React.useEffect(() => {
        let animationId: number;
        if (isActive) {
            animationId = requestAnimationFrame(() => {
                if (network && initialRender) {
                    network.fit();
                    setInitialRender(false);
                }
            });
        }
        if (!isActive) {
            setNodeInfo(undefined);
        }
        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isActive, network, initialRender]);

    const colorsRef = useRef(colors);
    const progressRef = useRef(progress);
    const prepareNodeRef = useRef(prepareNode);
    React.useEffect(() => {
        let unmounted = false;
        async function prepare() {
            const {nodes: graphNodes, edges: graphEdges} = (await layoutGraph(
                graph,
            )) as ProcessedGraph;
            const newNodes = new DataSet(graphNodes);
            if (progressRef.current) {
                updateProgress(newNodes, progressRef.current);
            }
            updateColors(newNodes, colorsRef.current);
            if (prepareNodeRef.current) {
                prepareNodes(newNodes, prepareNodeRef.current);
            }
            setInitialRender(
                nodes.length !== newNodes.length || edges.length !== graphEdges.length,
            );
            nodes.clear();
            nodes.add(newNodes.get());
            edges.clear();
            edges.add(graphEdges);
            repaint();
        }
        prepare().catch((e) => {
            if (!unmounted) {
                setError(e ?? 'Unknown error');
            }
        });
        return () => {
            unmounted = true;
        };
    }, [graph, edges, nodes, repaint]);

    React.useEffect(() => {
        if (progress) {
            updateProgress(nodes, progress, prepareNodeRef.current, colorsRef.current);
            repaint();
        }
    }, [progress, nodes, repaint]);

    React.useEffect(() => {
        if (typeof prepareNode === 'function') {
            prepareNodes(nodes, prepareNode);
            repaint();
        }
    }, [prepareNode, nodes, repaint]);

    React.useEffect(() => {
        updateColors(nodes, colors);
    }, [nodes, colors]);

    const fitGraphRef = React.useRef<boolean>(true);
    React.useLayoutEffect(() => {
        if (graphContainer && network) {
            const observer = new ResizeObserver(() => {
                redrawNetwork(network, fitGraphRef.current);
            });
            observer.observe(graphContainer);
            return () => {
                observer.unobserve(graphContainer);
            };
        }
        return undefined;
    }, [graphContainer, network]);

    React.useEffect(() => {
        if (network) {
            const handleHoverEdge = function ({edge}: any) {
                const hoveredEdges = getFullEdge(network, nodes, edge);
                network.selectEdges([...hoveredEdges]);
            };
            const handleBlurEdge = () => {
                network.unselectAll();
            };
            const handleHoverNode = ({node}: {node: string}) => {
                if (!node) {
                    return;
                }
                const hoveredNode = nodes.get(node);
                hoveredNodeRef.current = hoveredNode ?? undefined;

                if (!hoveredNode) {
                    return;
                }

                const connectedEdges = getConnectedEdges(network, nodes, node);
                network.selectEdges([...connectedEdges]);

                if (hoveredNode.url) {
                    graphContainer?.style.setProperty('cursor', 'pointer');
                }

                if (hoveredNode.type === 'in' || hoveredNode.type === 'out') {
                    graphContainer?.classList.add(showTooltipClass);
                }

                if (nodeHasInfo(hoveredNode)) {
                    const {x, y} = network.getPosition(node);
                    const rightPosition = network.canvasToDOM({x: x + 15, y});
                    const leftPosition = network.canvasToDOM({x: x - 15, y});
                    let position = rightPosition;
                    let placement: PopupProps['placement'] = 'right';
                    if (graphContainer) {
                        const {x, y, width} = graphContainer.getBoundingClientRect();
                        if (position.x + 330 > width) {
                            position = leftPosition;
                            placement = 'left';
                        }
                        position.x += x;
                        position.y += y;
                    }
                    setNodeInfo({
                        progress: hoveredNode.progress,
                        details: hoveredNode.details,
                        schemas: hoveredNode.schemas,
                        position,
                        placement,
                    });
                }
            };

            const handleBlurNode = () => {
                graphContainer?.classList.remove(showTooltipClass);
                graphContainer?.style.removeProperty('cursor');
                network.unselectAll();
                setNodeInfo(undefined);
                hoveredNodeRef.current = undefined;
            };

            const handleClick = () => {
                if (!hoveredNodeRef.current) {
                    return;
                }
                const node = hoveredNodeRef.current;
                if (node.url) {
                    openInNewTab(node.url);
                }
            };

            const handleZoom = () => {
                fitGraphRef.current = false;
            };

            network.on('hoverEdge', handleHoverEdge);
            network.on('blurEdge', handleBlurEdge);
            network.on('hoverNode', handleHoverNode);
            network.on('blurNode', handleBlurNode);
            network.on('click', handleClick);
            network.on('zoom', handleZoom);
            return () => {
                network.off('hoverEdge', handleHoverEdge);
                network.off('blurEdge', handleBlurEdge);
                network.off('hoverNode', handleHoverNode);
                network.off('blurNode', handleBlurNode);
                network.off('click', handleClick);
                network.off('zoom', handleZoom);
            };
        }
        return undefined;
    }, [network, nodes, graphContainer]);

    if (error) {
        return <Text color="danger">{`${error}`}</Text>;
    }

    return (
        <div ref={setGraphContainer} className={block(null, className)}>
            {nodes.length === 0 ? (
                <Loader size="m" local />
            ) : (
                <React.Fragment>
                    <VisNetwork
                        nodes={nodes}
                        edges={edges}
                        options={options}
                        className={block('graph')}
                        getNetwork={setNetwork}
                    />
                    {network && showMinimap ? (
                        <Minimap
                            className={block('minimap-wrapper')}
                            network={network}
                            nodes={nodes}
                            edges={edges}
                            options={options}
                        />
                    ) : null}
                    <div className={block('toolbar')}>
                        <Button
                            className={block('toolbar-button')}
                            onClick={() => {
                                if (network) {
                                    network.moveTo({
                                        scale: network.getScale() * 1.1,
                                    });
                                    fitGraphRef.current = false;
                                    // countEvent(`result.plan.actions.scale.zoom-in`);
                                }
                            }}
                        >
                            <Icon data={plusIcon} size={16} />
                        </Button>
                        <Button
                            className={block('toolbar-button')}
                            onClick={() => {
                                if (network) {
                                    network.moveTo({
                                        scale: network.getScale() / 1.1,
                                    });
                                    fitGraphRef.current = false;
                                    // countEvent(`result.plan.actions.scale.zoom-out`);
                                }
                            }}
                        >
                            <Icon data={minusIcon} size={16} />
                        </Button>
                        <Button
                            className={block('toolbar-button')}
                            onClick={() => {
                                network?.fit();
                                fitGraphRef.current = true;
                                // countEvent(`result.plan.actions.scale.fit`);
                            }}
                        >
                            <Icon data={fitIcon} size={16} />
                        </Button>
                        <LegendInfo
                            nodes={nodes}
                            className={block('toolbar-button', block('legend'))}
                        />
                    </div>
                    {nodeInfo && isActive ? (
                        <Popup
                            anchorElement={nodeInfoRef.current}
                            open
                            placement={nodeInfo.placement}
                        >
                            <OperationNodeInfo {...nodeInfo} containerRef={nodeInfoContainerRef} />
                        </Popup>
                    ) : null}
                </React.Fragment>
            )}
        </div>
    );
}

function useConfig(colors: GraphColors): Options {
    return React.useMemo(
        () => ({
            width: '100%',
            height: '100%',
            autoResize: false,

            configure: false,

            edges: {
                arrows: {
                    from: {
                        enabled: true,
                        type: 'circle',
                        scaleFactor: 0.1,
                    },
                    to: true,
                },
                arrowStrikethrough: false,
                smooth: {
                    enabled: true,
                    type: 'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.5,
                },
                color: {
                    color: colors.edge.color,
                    highlight: colors.edge.highlight,
                    inherit: false,
                    opacity: 1.0,
                },
                hoverWidth: 0.5,
                width: 1,
                selectionWidth: 0.5,
                selfReference: {
                    size: 80,
                },
            },

            nodes: {
                font: {
                    color: colors.text.label,
                    size: 16,
                },
            },

            layout: {
                hierarchical: false,
            },
            interaction: {
                dragNodes: false,
                navigationButtons: false,
                hover: true,
                hoverConnectedEdges: false,
                selectable: false,
                zoomSpeed: 0.5,
            },
            physics: false,
        }),
        [colors],
    );
}
