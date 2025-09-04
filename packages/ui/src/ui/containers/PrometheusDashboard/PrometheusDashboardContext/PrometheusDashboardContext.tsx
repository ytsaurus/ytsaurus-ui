import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {PrometheusDashboardType, PrometheusWidgetId} from '../../../../shared/prometheus/types';

import {prometheusDashboardSlice} from '../../../store/reducers/prometheusDashboard/prometheusDahsboard';
import {RootState} from '../../../store/reducers';
import {calcFromTo} from '../../../components/Timeline';

type PrometheusDashboardContextData = {
    expandedId?: PrometheusWidgetId;
    toggleExpanded: (id: PrometheusWidgetId) => void;

    timeRangeFilter: RootState['prometheusDashboard']['timeRangeFilter'];
    setTimeRangeFilter: (v: RootState['prometheusDashboard']['timeRangeFilter']) => void;
};

const PrometheusDashboardContext = React.createContext<PrometheusDashboardContextData>({
    expandedId: undefined,
    toggleExpanded: throwContextError,
    timeRangeFilter: {shortcutValue: '1h'},
    setTimeRangeFilter: throwContextError,
});

function throwContextError() {
    throw new Error(
        `Please make sure you are using <PrometheusDashboardContext.Provider /> in parents.`,
    );
}

export function PrometheusDashboardProvider({
    children,
    type,
    timeRange,
}: {
    children: React.ReactNode;
    type: PrometheusDashboardType;
    timeRange?: {from: number; to?: number};
}) {
    const dispatch = useDispatch();
    const {expandedPanels, timeRangeFilter} = useSelector(
        (state: RootState) => state.prometheusDashboard,
    );
    const {[type]: expandedId} = expandedPanels ?? {};

    const value = React.useMemo(() => {
        return {
            expandedId,
            toggleExpanded: (id: PrometheusWidgetId) => {
                if (id === expandedId) {
                    dispatch(prometheusDashboardSlice.actions.setExpandedId({type, id: undefined}));
                } else {
                    dispatch(prometheusDashboardSlice.actions.setExpandedId({type, id}));
                }
            },
            timeRangeFilter,
            setTimeRangeFilter(v: typeof timeRangeFilter) {
                dispatch(prometheusDashboardSlice.actions.setTimeRangeFilter({timeRangeFilter: v}));
            },
        };
    }, [expandedId, timeRangeFilter, type, dispatch]);

    React.useEffect(() => {
        if (timeRangeFilter.from === undefined || timeRangeFilter.to === undefined || timeRange) {
            const {from, to} = {...calcFromTo(timeRangeFilter), ...timeRange};
            dispatch(
                prometheusDashboardSlice.actions.setTimeRangeFilter({
                    timeRangeFilter: {...timeRangeFilter, from, to},
                }),
            );
        }
    }, [timeRangeFilter, dispatch]);

    return (
        <PrometheusDashboardContext.Provider value={value}>
            {children}
        </PrometheusDashboardContext.Provider>
    );
}

export function usePrometheusDashboardContext() {
    return React.useContext(PrometheusDashboardContext);
}
