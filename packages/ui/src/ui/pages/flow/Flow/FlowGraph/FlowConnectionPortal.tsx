import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {type Graph, type TConnection} from '@gravity-ui/graph';
import ArrowShapeRightToLineIcon from '@gravity-ui/icons/svgs/arrow-shape-right-to-line.svg';
import FlagIcon from '@gravity-ui/icons/svgs/flag.svg';
import {Flex, Icon, type IconData, Text, Tooltip} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';
import {PopupLayer} from '../../../../components/YTGraph/PopupLayer/PopupLayer';

import {type FlowGraphBlock} from './FlowGraph';
import './FlowConnectionPortal.scss';

const block = cn('yt-flow-connection-portal');

export type FlowConnectionPortState = 'drain' | 'backpressure';

export type FlowConnection = TConnection & {
    /** ID of the stream block on this edge, used to look up stream metadata for the tooltip */
    streamBlockId?: string;
    portState?: FlowConnectionPortState;
};

type FlowConnectionPortalProps = {
    graph: Graph;
    connections: FlowConnection[];
    blockById: Map<string, FlowGraphBlock>;
};

export function FlowConnectionPortal({graph, connections, blockById}: FlowConnectionPortalProps) {
    const [ready, setReady] = useState(false);
    const layerRef = useRef<PopupLayer | null>(null);

    useEffect(() => {
        if (!graph) {
            return undefined;
        }

        layerRef.current = graph.addLayer(PopupLayer, {});
        setReady(true);

        return () => {
            if (layerRef.current) {
                graph.detachLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [graph]);

    if (!ready || !layerRef.current) {
        return null;
    }

    const portIcons = connections
        .filter((c) => c.streamBlockId && c.portState)
        .map((connection) => {
            const sourceBlock = blockById.get(connection.sourceBlockId as string);
            const streamBlock = blockById.get(connection.streamBlockId!);

            if (!sourceBlock || !streamBlock) {
                return null;
            }

            if (streamBlock.is !== 'stream') {
                return null;
            }

            // Lines leave their source block from its right edge.
            // Put the icon center at that exit point.
            const pos = {
                x: sourceBlock.x + sourceBlock.width,
                y: sourceBlock.y + sourceBlock.height / 2,
            };

            const key = `${String(connection.sourceBlockId)}:${String(connection.targetBlockId)}`;

            return (
                <PortIcon
                    key={key}
                    x={pos.x}
                    y={pos.y}
                    portState={connection.portState!}
                    streamBlock={streamBlock}
                />
            );
        });

    return createPortal(<>{portIcons}</>, layerRef.current.getHTML());
}

type PortIconProps = {
    x: number;
    y: number;
    portState: FlowConnectionPortState;
    streamBlock: FlowGraphBlock;
};

const PORT_ICON_BY_STATE: Record<FlowConnectionPortState, IconData> = {
    drain: ArrowShapeRightToLineIcon,
    backpressure: FlagIcon,
};

function PortIcon({x, y, portState, streamBlock}: PortIconProps) {
    const stopPropagation = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
    };

    return (
        <Tooltip
            content={<StreamTooltipContent portState={portState} streamBlock={streamBlock} />}
            placement="top"
        >
            <button
                className={block('icon', {type: portState})}
                style={{left: x, top: y}}
                type="button"
                onClick={stopPropagation}
                onMouseEnter={stopPropagation}
                onMouseMove={stopPropagation}
                onMouseLeave={stopPropagation}
            >
                <Icon data={PORT_ICON_BY_STATE[portState]} size={16} />
            </button>
        </Tooltip>
    );
}

function StreamTooltipContent({
    portState,
    streamBlock,
}: {
    portState: FlowConnectionPortState;
    streamBlock: FlowGraphBlock;
}) {
    const meta = streamBlock.meta as Record<string, unknown>;

    return (
        <div className={block('tooltip-content')}>
            <Text variant="subheader-1">
                {portState === 'backpressure' ? 'Backpressure' : 'Drain'}: {streamBlock.name}
            </Text>
            <div className={block('tooltip-row')}>
                <span className={block('tooltip-label')}>Throughput</span>
                <Flex direction="column" alignItems="flex-end">
                    <span>
                        {format.Number(meta?.messages_per_second as number | undefined)} pcs/s
                    </span>
                    <span>
                        {format.Bytes(meta?.bytes_per_second as number | undefined, {digits: 1})}
                        /s
                    </span>
                </Flex>
            </div>
            <div className={block('tooltip-row')}>
                <span className={block('tooltip-label')}>Inflight</span>
                <Flex direction="column" alignItems="flex-end">
                    <span>{format.Number(meta?.inflight_rows as number | undefined)} rows</span>
                    <span>
                        {format.Bytes(meta?.inflight_bytes as number | undefined, {digits: 1})}
                    </span>
                </Flex>
            </div>
        </div>
    );
}
