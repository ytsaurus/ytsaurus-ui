import {Graph, TAnchor} from '@gravity-ui/graph';
import {GraphBlockAnchor} from '@gravity-ui/graph/build/react-components';
import ArrowShapeRightToLineIcon from '@gravity-ui/icons/svgs/arrow-shape-right-to-line.svg';
import CircleInfoIcon from '@gravity-ui/icons/svgs/circle-info.svg';
import FlagIcon from '@gravity-ui/icons/svgs/flag.svg';
import {Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {
    type FlowComputationRuntimeType,
    type FlowComputationUIStreamsSummary,
} from '../../../../../../pages/flow/Flow/types';
import {FlowGraphBlock} from '../../FlowGraph';
import {
    COMPUTATION_ANCHOR_SIZE,
    COMPUTATION_IN,
    COMPUTATION_OUT,
    type FlowComputationAnchorType,
    getStreamsSummmaryByAnchorType,
    hasVisibleStreamsSummaryDetails,
} from '../../utils/utils';
import './FlowGraphAnchors.scss';

const block = cn('yt-flow-graph-anchors');

export function FlowGraphAnchors({graph, data}: {graph: Graph; data: FlowGraphBlock}) {
    const {anchors = []} = data;

    return anchors.map((anchor) => {
        switch (anchor.type) {
            case COMPUTATION_IN:
            case COMPUTATION_OUT: {
                const summary = getStreamsSummmaryByAnchorType(
                    data.meta as FlowComputationRuntimeType,
                    anchor.type as any as FlowComputationAnchorType,
                );
                return hasVisibleStreamsSummaryDetails(summary) ? (
                    <FlowComputationStreamsSummary
                        key={anchor.type}
                        data={summary}
                        graph={graph}
                        anchor={anchor}
                    />
                ) : null;
            }
            default:
                return null;
        }
    });
}

const ICON_SIZE = 12;

export function FlowComputationStreamsSummary({
    data,
    graph,
    anchor,
}: {
    data: FlowComputationUIStreamsSummary;
    graph: Graph;
    anchor: TAnchor;
}) {
    const {drained, backpressureDetected: backpressured} = data;

    let svgIcon = CircleInfoIcon;
    if (drained) {
        svgIcon = FlagIcon;
    } else if (backpressured) {
        svgIcon = ArrowShapeRightToLineIcon;
    }

    return (
        <GraphBlockAnchor
            className={block('computation-anchor')}
            graph={graph}
            anchor={anchor}
            position="absolute"
        >
            <div className={block('summary')}>
                <div
                    className={block('summary-inner', {
                        drained,
                        backpressured,
                    })}
                    style={{padding: (COMPUTATION_ANCHOR_SIZE - 2 - ICON_SIZE) / 2}}
                >
                    <Icon data={svgIcon} size={ICON_SIZE} color={'warning-heavy'} />
                </div>
            </div>
        </GraphBlockAnchor>
    );
}
