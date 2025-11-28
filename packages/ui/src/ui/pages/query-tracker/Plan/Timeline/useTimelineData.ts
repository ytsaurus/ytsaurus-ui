import * as React from 'react';
import {useThemeValue} from '@gravity-ui/uikit';

import {useSelector} from '../../../../store/redux-hooks';
import {
    getNodesWithProgress,
    getQueryStartedAtMillis,
} from '../../../../store/selectors/query-tracker/queryPlan';
import {useGraphColors} from '../GraphColors';
import {NodeState} from '../models/plan';
import {OperationTimeline, RawAxis, RowType, parseGraph} from './utils';
import {TimelineAxis} from '@gravity-ui/timeline';
import {ROW_HEIGHT} from './constants';
import {OperationRenderer} from './renderer/OperationRenderer';

export interface FilteredAxis extends RawAxis {
    tracksCount: number;
    isExpanded: boolean;
}

export interface UseTimelineDataResult {
    timelineAxes: TimelineAxis[];
    filteredAxes: FilteredAxis[];
    tableItems: RowType[];
    isSomeAxesCollapsed: boolean;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    stateFilter: NodeState | undefined;
    setStateFilter: React.Dispatch<React.SetStateAction<NodeState | undefined>>;
    handleExpandAxis: (id: string) => void;
    handleExpandAll: () => void;
    timelineEvents: OperationTimeline[];
}

export function useTimelineData(): UseTimelineDataResult {
    const theme = useThemeValue();
    const colors = useGraphColors();

    const nodes = useSelector(getNodesWithProgress);
    const queryStartedAtMillis = useSelector(getQueryStartedAtMillis);

    const [expandedAxesSet, setExpandedAxesSet] = React.useState(new Set<string>());
    const [search, setSearch] = React.useState('');
    const [stateFilter, setStateFilter] = React.useState<NodeState>();

    const axes = React.useMemo(() => {
        return parseGraph({nodes, colors, theme, queryStartedAtMillis});
    }, [nodes, colors, theme, queryStartedAtMillis]);

    const {filteredAxes, isSomeAxesCollapsed} = React.useMemo(() => {
        const cleanedSearch = search.toLowerCase().trim();

        const filteredAxes: FilteredAxis[] = [];
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
        const timelineAxes: TimelineAxis[] = [];
        let top = 0;

        filteredAxes.forEach((axis, index) => {
            if (index) {
                top += (timelineAxes.at(-1)?.tracksCount || 0) * ROW_HEIGHT;
            }

            timelineAxes.push({
                id: axis.id,
                tracksCount: axis.isExpanded ? axis.events.length : 1,
                top,
                height: ROW_HEIGHT,
            });
        });

        return timelineAxes;
    }, [filteredAxes]);

    const timelineEvents = React.useMemo(() => {
        return filteredAxes.reduce<OperationTimeline[]>((acc, axis) => {
            if (!axis.events || !axis.events.length) {
                return acc;
            }

            const events = axis.isExpanded ? axis.events : [axis.events[0]];

            events.forEach((event, index) => {
                acc.push({
                    ...event,
                    id: axis.id,
                    axisId: event.axisId,
                    trackIndex: index,
                    isExpanded: axis.isExpanded,
                    renderer: new OperationRenderer(),
                });
            });

            return acc;
        }, []);
    }, [filteredAxes]);

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

    const handleExpandAxis = React.useCallback((id: string) => {
        setExpandedAxesSet((prev) => {
            const newExpandedAxes = new Set(prev);
            if (newExpandedAxes.has(id)) {
                newExpandedAxes.delete(id);
            } else {
                newExpandedAxes.add(id);
            }
            return newExpandedAxes;
        });
    }, []);

    const handleExpandAll = React.useCallback(() => {
        if (isSomeAxesCollapsed) {
            const newExpandedAxes = new Set(
                axes.filter(({isExpandable}) => isExpandable).map(({id}) => id),
            );
            setExpandedAxesSet(newExpandedAxes);
        } else {
            setExpandedAxesSet(new Set());
        }
    }, [isSomeAxesCollapsed, axes]);

    return {
        timelineAxes,
        filteredAxes,
        tableItems,
        isSomeAxesCollapsed,
        search,
        setSearch,
        stateFilter,
        setStateFilter,
        handleExpandAxis,
        handleExpandAll,
        timelineEvents,
    };
}
