import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import isEqual_ from 'lodash/isEqual';

import type {PrometheusDashboardType} from '../../../../shared/prometheus/types';
import {calcFromTo} from '../../../components/Timeline';

import {prometheusDashboardSelectors, prometheusDashboardSlice} from './prometheusDashboard';

export function usePrometheusDashboardParams<ParamsT extends Record<string, unknown>>(t: string) {
    const type = t as PrometheusDashboardType;
    const dispatch = useDispatch();
    const params: ParamsT = (useSelector(prometheusDashboardSelectors.getParams)[
        type as PrometheusDashboardType
    ] ?? {}) as ParamsT;

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

export function usePrometheusDashboardType<T extends string = PrometheusDashboardType>(
    allowedValues?: Array<T>,
    defaultValue?: T,
) {
    const dispatch = useDispatch();
    const type = useSelector(prometheusDashboardSelectors.getType) as T;

    const setType = React.useCallback(
        (v: typeof type) => {
            dispatch(
                prometheusDashboardSlice.actions.setType({type: v as PrometheusDashboardType}),
            );
        },
        [dispatch],
    );

    const effectiveType = React.useMemo(() => {
        let res = type;
        if (allowedValues && -1 === allowedValues.indexOf(type)) {
            res = defaultValue ?? allowedValues[0];
            setType(res);
        }
        return res;
    }, [type, allowedValues, defaultValue, setType]);

    return {
        type: effectiveType,
        setType,
    };
}

const HOUR = 3600 * 1000;

export function usePrometheusDashbordTimeRange(initialTimeRange?: {from?: number; to?: number}) {
    const dispatch = useDispatch();
    const timeRange = useSelector(prometheusDashboardSelectors.getTimeRange);

    const initialRef = React.useRef<typeof initialTimeRange>();

    const setTimeRange = React.useCallback(
        (v: typeof timeRange) => {
            dispatch(prometheusDashboardSlice.actions.setTimeRangeFilter({timeRangeFilter: v}));
        },
        [dispatch],
    );

    React.useEffect(() => {
        if (
            timeRange.from === undefined ||
            timeRange.to === undefined ||
            !isEqual_(initialTimeRange, initialRef.current)
        ) {
            const now = Date.now();
            const {from = now - HOUR, to = now} = {
                ...calcFromTo(timeRange),
                ...initialTimeRange,
            };
            initialRef.current = initialTimeRange;
            setTimeRange({...timeRange, from, to});
        }
    }, [timeRange, initialTimeRange, setTimeRange]);

    return {
        timeRange,
        setTimeRange,
    };
}
