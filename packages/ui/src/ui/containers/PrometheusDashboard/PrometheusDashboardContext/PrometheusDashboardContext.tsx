import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {PrometheusDashboardType, PrometheusWidgetId} from '../../../../shared/prometheus/types';

import {prometheusDashboardSlice} from '../../../store/reducers/prometheusDashboard/prometheusDashboard';
import {usePrometheusDashbordTimeRange} from '../../../store/reducers/prometheusDashboard/prometheusDashboard-hooks';
import {RootState} from '../../../store/reducers';

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
}: {
    children: React.ReactNode;
    type: PrometheusDashboardType;
}) {
    const dispatch = useDispatch();
    const expandedPanels = useSelector(
        (state: RootState) => state.prometheusDashboard.expandedPanels,
    );
    const {[type]: expandedId} = expandedPanels ?? {};

    const {timeRange, setTimeRange} = usePrometheusDashbordTimeRange();

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
            timeRangeFilter: timeRange,
            setTimeRangeFilter: setTimeRange,
        };
    }, [expandedId, timeRange, setTimeRange, type, dispatch]);

    return (
        <PrometheusDashboardContext.Provider value={value}>
            {children}
        </PrometheusDashboardContext.Provider>
    );
}

export function usePrometheusDashboardContext() {
    return React.useContext(PrometheusDashboardContext);
}
