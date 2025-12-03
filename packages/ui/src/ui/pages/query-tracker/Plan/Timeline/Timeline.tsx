import * as React from 'react';

import {Select, TextInput, useThemeValue} from '@gravity-ui/uikit';

import cn from 'bem-cn-lite';

import reduce_ from 'lodash/reduce';

import {DataSet} from 'vis-data';
import {Timeline as TimelineRuler} from '../../../../components/Timeline';
import {BoundsChangedEvent, yaTimelineConfig} from '../../../../packages/ya-timeline';
import {NodeState} from '../models/plan';

import {useGraphColors} from '../GraphColors';
import {
    ProcessedGraph,
    ProcessedNode,
    prepareNodes,
    updateProgress,
    useOperationNodesStates,
} from '../utils';

import {EventGroup, Timeline} from './TimelineCanvas';
import {RowType, TimelineTable} from './TimelineTable';
import {OperationColorsType, parseGraph, useTimelineInterval} from './utils';

import './Timeline.scss';
import {useSelector} from '../../../../store/redux-hooks';
import {getQuerySingleProgress} from '../../../../store/selectors/query-tracker/query';

const block = cn('timeline');

type YqlTimelineAxis = {
    id: string;
    label: string;
};

export type ExtendedEventGroup = EventGroup & {
    name?: string;
    colors?: OperationColorsType;
};

export type OnRulerUpdateProps = {from?: number; to?: number};

export interface AxisProps extends YqlTimelineAxis {
    events: ExtendedEventGroup[];
    from: number;
    to: number;
    notStarted?: boolean;
    status: string;
    level: number;
    node: ProcessedNode;
    isExpandable: boolean;
}

interface TimelineWithSidebarProps {
    graph: ProcessedGraph;
    prepareNode?: (node: ProcessedNode) => ProcessedNode;
}

function TimelineWithSidebar({graph, prepareNode}: TimelineWithSidebarProps) {
    const {yql_progress: progress} = useSelector(getQuerySingleProgress);
    const theme = useThemeValue();

    const colors = useGraphColors();

    const [nodes] = React.useState(() => new DataSet<ProcessedNode>());
    const [shouldRepaint, repaint] = React.useState({});

    const [expandedAxesSet, setExpandedAxesSet] = React.useState(new Set<string>());

    const [search, setSearch] = React.useState('');
    const [stateFilter, setStateFilter] = React.useState<NodeState>();

    const states = useOperationNodesStates(nodes);

    const progressRef = React.useRef(progress);
    progressRef.current = progress;
    const prepareNodeRef = React.useRef(prepareNode);
    prepareNodeRef.current = prepareNode;

    React.useEffect(() => {
        nodes.clear();
        nodes.add(graph.nodes);
        if (progressRef.current) {
            updateProgress(nodes, progressRef.current, prepareNodeRef.current, undefined, false);
        }
        repaint({});
    }, [nodes, graph]);

    React.useEffect(() => {
        if (progress) {
            updateProgress(nodes, progress, prepareNodeRef.current, undefined, false);
            repaint({});
        }
    }, [nodes, progress]);

    React.useEffect(() => {
        if (typeof prepareNode === 'function') {
            prepareNodes(nodes, prepareNode);
            repaint({});
        }
    }, [nodes, prepareNode]);

    const {axes, events} = React.useMemo(() => {
        const queryStartedAtMillis = reduce_(
            progressRef.current,
            (acc, el) => {
                const start = el.startedAt ? new Date(el.startedAt).getTime() : Infinity;
                return Math.min(start, acc);
            },
            Infinity,
        );
        const axes = nodes ? parseGraph({nodes, colors, theme, queryStartedAtMillis}) : [];
        const events = axes.map((axis: AxisProps) => axis.events ?? []).flat() ?? [];
        return {axes, events};
    }, [nodes, colors, theme, shouldRepaint]);

    const [{timelineStart, timelineEnd, timelineRulerKey}, setUserInterval] =
        useTimelineInterval(axes);

    const {filteredAxes, isSomeAxesCollapsed} = React.useMemo(() => {
        const cleanedSearch = search.toLowerCase().trim();

        const filteredAxes = [];

        let isSomeAxesCollapsed = false;

        for (const axis of axes) {
            if (cleanedSearch && !axis.label.toLowerCase().includes(cleanedSearch)) {
                continue;
            }
            if (stateFilter && axis.status !== stateFilter) {
                continue;
            }
            const isExpanded = axis.isExpandable ? expandedAxesSet.has(axis.id) : false;

            if (!isSomeAxesCollapsed && axis.isExpandable && !isExpanded) {
                isSomeAxesCollapsed = true;
            }
            const tracksCount = isExpanded ? axis.events.length : 1;
            filteredAxes.push({...axis, tracksCount, isExpanded});
        }

        return {filteredAxes, isSomeAxesCollapsed};
    }, [axes, search, stateFilter, expandedAxesSet]);

    const timelineAxes = React.useMemo(() => {
        let offset = 0;
        return filteredAxes.map((axis) => {
            const axisHeight = yaTimelineConfig.TRACK_HEIGHT * axis.tracksCount;
            const timelineAxis = {
                id: axis.id,
                top: offset,
                height: axisHeight,
                tracksCount: axis.tracksCount,
            };

            offset += axisHeight;

            return timelineAxis;
        });
    }, [filteredAxes]);

    const handleExpandAxis = (id: string) => {
        const newExpandedAxes = new Set(expandedAxesSet);
        if (newExpandedAxes.has(id)) {
            newExpandedAxes.delete(id);
        } else {
            newExpandedAxes.add(id);
        }

        setExpandedAxesSet(newExpandedAxes);
    };

    const handleExpandAll = () => {
        if (isSomeAxesCollapsed) {
            const newExpandedAxes = new Set(
                axes.filter(({isExpandable}) => isExpandable).map(({id}) => id),
            );
            setExpandedAxesSet(newExpandedAxes);
        } else {
            setExpandedAxesSet(new Set());
        }
    };

    const sidebarRef = React.useRef<HTMLDivElement | null>(null);
    const [canvasScrollTop, setCanvasScrollTop] = React.useState<number>(0);

    const handleSidebarScroll = () => {
        if (sidebarRef.current) {
            setCanvasScrollTop(sidebarRef.current.scrollTop);
        }
    };

    const handleCanvasScroll = (event: CustomEvent<{scrollTop: number}>) => {
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = event.detail.scrollTop;
        }
    };

    const handleRulerUpdate = ({from, to}: OnRulerUpdateProps) => {
        setUserInterval({start: from, end: to});
    };

    const handleBoundsChanged = (event: BoundsChangedEvent) => {
        handleRulerUpdate({from: event.detail.start, to: event.detail.end});
    };

    const tableItems = React.useMemo(() => {
        const items: RowType[] = [];

        filteredAxes.forEach((axis) => {
            items.push(axis);

            if (axis.isExpanded) {
                axis.events?.forEach((event, index) => {
                    if (index === 0) {
                        return;
                    }
                    items.push({...event, node: axis.node, isEvent: true});
                });
            }
        });

        return items;
    }, [filteredAxes]);

    const renderFilters = () => {
        return (
            <div className={block('filters')}>
                <TextInput
                    className={block('filters-search')}
                    hasClear
                    value={search}
                    onUpdate={setSearch}
                    placeholder={'Filter by name'}
                />
                <Select<NodeState>
                    className={block('filters-status')}
                    multiple={false}
                    label="Status"
                    placeholder={'Select status'}
                    value={stateFilter ? [stateFilter] : []}
                    options={states.map(({state, title, count}) => ({
                        value: state,
                        content: `${title}${count > 0 ? ` (${count})` : ''}`,
                    }))}
                    width={230}
                    hasClear
                    onUpdate={(value) => {
                        setStateFilter(value[0] as NodeState);
                    }}
                />
            </div>
        );
    };

    return (
        <div className={block()}>
            {renderFilters()}
            <div className={block('content-wrapper')}>
                <TimelineTable
                    tableItems={tableItems}
                    isSomeAxesCollapsed={isSomeAxesCollapsed}
                    blocksQuantity={filteredAxes.length}
                    onExpandAll={handleExpandAll}
                    onSidebarScroll={handleSidebarScroll}
                    onRulerUpdate={handleRulerUpdate}
                    sidebarRef={sidebarRef}
                    onExpandAxis={handleExpandAxis}
                />
                {timelineStart && timelineEnd && (
                    <div className={block('container')}>
                        <div className={block('ruler-wrapper')}>
                            <TimelineRuler
                                key={timelineRulerKey}
                                from={timelineStart}
                                to={timelineEnd}
                                onUpdate={handleRulerUpdate}
                                hasPicker={false}
                                hasDatePicker={false}
                                hasRulerNowButton={false}
                                minRange={timelineStart}
                                maxRange={timelineEnd}
                            />
                        </div>
                        {Boolean(timelineAxes.length) && (
                            <Timeline
                                className={block('timeline')}
                                canvasScrollTop={canvasScrollTop}
                                scrollTopChanged={handleCanvasScroll}
                                start={timelineStart}
                                end={timelineEnd}
                                boundsChanged={handleBoundsChanged}
                                axes={timelineAxes}
                                events={events}
                                theme={theme}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TimelineWithSidebar;
