import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {
    PrometheusDashboardType,
    PrometheusWidgetId,
} from '../../../../shared/prometheus/types';

import {EMPTY_OBJECT} from '../../../constants/empty';

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
