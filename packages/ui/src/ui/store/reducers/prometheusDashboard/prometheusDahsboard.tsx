import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {EMPTY_OBJECT} from '../../../constants/empty';
import type {PrometheusWidgetId} from '../../../containers/PrometheusDashboard/types';

export type PrometheusDashboardType =
    | 'account'
    | 'bundle-ui-user-load'
    | 'bundle-ui-resource'
    | 'bundle-ui-cpu'
    | 'bundle-ui-memory'
    | 'bundle-ui-disk'
    | 'bundle-ui-lsm'
    | 'bundle-ui-network'
    | 'bundle-ui-efficiency'
    | 'bundle-ui-rpc-proxy-overview'
    | 'bundle-ui-rpc-proxy'
    | 'chyt-monitoring'
    | 'cluster-resources'
    | 'master-global'
    | 'master-local'
    | 'queue-metrics'
    | 'queue-consumer-metrics'
    | 'scheduler-internal'
    | 'scheduler-pool';

export type PrometheusDashboardState = {
    expandedPanels: Partial<Record<PrometheusDashboardType, PrometheusWidgetId>>;

    timeRangeFilter:
        | {shortcutValue: string; from?: number; to?: number}
        | {from: number; to: number; shortcutValue?: undefined};
};

export const initialState: PrometheusDashboardState = {
    expandedPanels: EMPTY_OBJECT,
    timeRangeFilter: {shortcutValue: '30m'},
};

export const prometheusDashboardSlice = createSlice({
    initialState,
    name: 'prometheusDashboard',
    reducers: {
        setExpandedId(
            state,
            {
                payload: {type, id},
            }: PayloadAction<{
                type: PrometheusDashboardType;
                id: PrometheusWidgetId | undefined;
            }>,
        ) {
            const {[type]: _prevId, ...rest} = state.expandedPanels;
            const res = id === undefined ? rest : {...state, [type]: id};

            return {...state, expandedPanels: Object.keys(res).length === 0 ? EMPTY_OBJECT : res};
        },
        setTimeRangeFilter(state, {payload}: PayloadAction<Pick<typeof state, 'timeRangeFilter'>>) {
            return {...state, ...payload};
        },
    },
});
