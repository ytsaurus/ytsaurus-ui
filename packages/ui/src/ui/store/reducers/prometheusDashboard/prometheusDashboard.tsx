import {type PayloadAction, createSlice} from '@reduxjs/toolkit';

import {
    type PrometheusDashboardType,
    type PrometheusWidgetId,
} from '../../../../shared/prometheus/types';

import {EMPTY_OBJECT} from '../../../constants/empty';
import {type RootState} from '../../../store/reducers/index.main';

export type PrometheusDashboardState = {
    expandedPanels: Partial<Record<PrometheusDashboardType, PrometheusWidgetId>>;

    timeRangeFilter:
        | {shortcutValue: string; from?: number; to?: number}
        | {from: number; to: number; shortcutValue?: undefined};

    type?: PrometheusDashboardType;
    params: Partial<Record<PrometheusDashboardType, Record<string, unknown>>>;
};

export const initialState: PrometheusDashboardState = {
    expandedPanels: EMPTY_OBJECT,
    timeRangeFilter: {shortcutValue: '30m'},
    params: EMPTY_OBJECT,
};

export const prometheusDashboardSlice = createSlice({
    initialState,
    name: 'prometheusDashboard',
    selectors: {
        getType: (state) => state.type,
        getParams: (state) => state.params,
        getTimeRange: (state) => state.timeRangeFilter,
    },
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
            if (id === undefined) {
                delete state.expandedPanels[type];
            } else {
                // eslint-disable-next-line no-param-reassign
                state.expandedPanels[type] = id;
            }
        },
        setType(
            state,
            {
                payload: {type},
            }: PayloadAction<{
                type: PrometheusDashboardType;
            }>,
        ) {
            // eslint-disable-next-line no-param-reassign
            state.type = type;
        },
        setParams(
            state,
            {
                payload: {type, params},
            }: PayloadAction<{type: PrometheusDashboardType; params: Record<string, unknown>}>,
        ) {
            Object.keys(params).forEach((k) => {
                const v = params[k];
                // eslint-disable-next-line no-param-reassign
                const dst = (state.params[type] = state.params[type] ?? {});

                if (v === undefined) {
                    delete dst[k];
                } else {
                    dst[k] = v;
                }
            });
        },
        setTimeRangeFilter(state, {payload}: PayloadAction<Pick<typeof state, 'timeRangeFilter'>>) {
            return {...state, ...payload};
        },
        moveTimeRangeFilterTo(state, {payload}: PayloadAction<{timestamp: number}>) {
            const {to = 0, from = 0} = state.timeRangeFilter;
            const {timestamp} = payload;

            state.timeRangeFilter = {
                from: timestamp - (to - from),
                to: timestamp,
            };
        },
    },
});

export const prometheusDashboardSelectors = prometheusDashboardSlice.getSelectors(
    (state: RootState) => state.prometheusDashboard,
);
