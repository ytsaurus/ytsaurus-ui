import * as React from 'react';

import {Card} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {DataSet} from 'vis-data';
import type {DataSetEdges, Network, Options} from 'vis-network';

import {ProcessedNode, getConnectedEdges, getFullEdge} from '../../utils';
import VisNetwork from '../VisNetwork/VisNetwork';

import './Minimap.scss';

const block = cn('yql-plan-minimap');

interface MinimapProps {
    className?: string;
    network: Network;
    nodes: DataSet<ProcessedNode>;
    edges: DataSetEdges;
    options: Options;
}

export function Minimap({network, nodes, edges, options, className}: MinimapProps) {
    const minimapOptions = useMinimapOptions(options);
    const [minimap, setMinimap] = React.useState<Network>();
    const isDraggingRef = React.useRef(false);

    useSyncVisualEffects({network, minimap, nodes});
    const radarRef = useSyncRadar({network, minimap});

    React.useEffect(() => {
        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    React.useEffect(() => {
        if (minimap) {
            minimap.fit();
        }
    }, [minimap]);

    return (
        <Card className={block(null, className)} type="action">
            <VisNetwork
                nodes={nodes}
                edges={edges}
                options={minimapOptions}
                className={block('minimap')}
                getNetwork={setMinimap}
            />
            <div
                className={block('wrapper')}
                onMouseDown={(event) => {
                    if (minimap) {
                        // eslint-disable-next-line new-cap
                        const position = minimap.DOMtoCanvas({
                            x: event.nativeEvent.offsetX,
                            y: event.nativeEvent.offsetY,
                        });
                        network.moveTo({position});
                        isDraggingRef.current = true;
                    }
                }}
                onMouseMove={(event) => {
                    if (minimap && isDraggingRef.current) {
                        // eslint-disable-next-line new-cap
                        const position = minimap.DOMtoCanvas({
                            x: event.nativeEvent.offsetX,
                            y: event.nativeEvent.offsetY,
                        });
                        network.moveTo({position});
                    }
                }}
            />
            <div ref={radarRef} className={block('radar')} />
        </Card>
    );
}

interface UseSyncVisualEffectsProps {
    network: Network;
    minimap?: Network;
    nodes: DataSet<ProcessedNode>;
}
function useSyncVisualEffects({network, minimap, nodes}: UseSyncVisualEffectsProps) {
    React.useEffect(() => {
        const handleHoverEdge = function ({edge}: any) {
            const hoveredEdges = getFullEdge(network, nodes, edge);
            minimap?.selectEdges([...hoveredEdges]);
        };
        const handleBlurEdge = () => {
            minimap?.unselectAll();
        };
        const handleHoverNode = ({node}: {node: string}) => {
            if (!node) {
                return;
            }
            const hoveredNode = nodes.get(node);
            if (!hoveredNode) {
                return;
            }

            const connectedEdges = getConnectedEdges(network, nodes, node);
            minimap?.selectEdges([...connectedEdges]);
        };
        const handleBlurNode = () => {
            minimap?.unselectAll();
        };
        network.on('hoverEdge', handleHoverEdge);
        network.on('blurEdge', handleBlurEdge);
        network.on('hoverNode', handleHoverNode);
        network.on('blurNode', handleBlurNode);
        return () => {
            network.off('hoverEdge', handleHoverEdge);
            network.off('blurEdge', handleBlurEdge);
            network.off('hoverNode', handleHoverNode);
            network.off('blurNode', handleBlurNode);
        };
    }, [network, minimap, nodes]);
}

interface UseSyncRadarProps {
    network: Network;
    minimap?: Network;
}
function useSyncRadar({network, minimap}: UseSyncRadarProps) {
    const radarRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleAfterDrawing = () => {
            if (minimap && radarRef.current) {
                scaleMinimapRadar(radarRef.current, minimap, network);
            }
        };
        network.on('afterDrawing', handleAfterDrawing);
        return () => {
            network.off('afterDrawing', handleAfterDrawing);
        };
    }, [network, minimap]);

    return radarRef;
}

function useMinimapOptions(options: Options): Options {
    return React.useMemo(() => {
        return {
            ...options,
            edges: {
                ...options.edges,
                selectionWidth: 1,
            },
            interaction: {
                dragNodes: false,
                dragView: false,
                navigationButtons: false,
                hoverConnectedEdges: false,
                selectable: false,
                zoomView: false,
            },
        };
    }, [options]);
}

function scaleMinimapRadar(minimapRadar: HTMLDivElement, minimap: Network, network: Network) {
    // @ts-ignore
    const {clientWidth, clientHeight} = network.body.container;
    const networkScale = network.getScale();
    const minimapScale = minimap.getScale();
    const translate = network.getViewPosition();
    const dom = minimap.canvasToDOM(translate);
    minimapRadar.style.transform = `translate(calc(${dom.x}px - 50%), calc(${dom.y}px - 50%))`;
    minimapRadar.style.width = `${(clientWidth / networkScale) * minimapScale}px`;
    minimapRadar.style.height = `${(clientHeight / networkScale) * minimapScale}px`;
}
