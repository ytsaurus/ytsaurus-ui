import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {
    PrometheusDashboardType,
    PrometheusWidgetId,
} from '../../../../shared/prometheus/types';

import {EMPTY_OBJECT} from '../../../constants/empty';
import {RootState} from '../index.main';

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
    },
});

export const prometheusDashboardSelectors = prometheusDashboardSlice.getSelectors(
    (state: RootState) => state.prometheusDashboard,
);

export function usePrometheusDashboardParams<T extends Record<string, unknown>>(
    type: PrometheusDashboardType,
) {
    const dispatch = useDispatch();
    const params: T = (useSelector(prometheusDashboardSelectors.getParams)[type] ?? {}) as T;

    return {
        params,
        setParams: React.useCallback(
            (v: typeof params) => {
                dispatch(prometheusDashboardSlice.actions.setParams({type, params: v}));
            },
            [type, dispatch],
        ),
    };
}

export function usePrometheusDashboardType<T extends PrometheusDashboardType>(
    allowedValues?: Array<T>,
) {
    const dispatch = useDispatch();
    const type = useSelector(prometheusDashboardSelectors.getType) as T;

    const setType = React.useCallback(
        (v: typeof type) => {
            dispatch(prometheusDashboardSlice.actions.setType({type: v}));
        },
        [dispatch],
    );

    const effectiveType = React.useMemo(() => {
        let res = type;
        if (allowedValues && -1 === allowedValues.indexOf(type)) {
            res = allowedValues[0];
            setType(res);
        }
        return res;
    }, [type, setType, allowedValues]);

    return {
        type: effectiveType,
        setType,
    };
}
