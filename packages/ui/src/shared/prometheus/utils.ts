import {formatByParamsQuotedEnv} from '../utils/format';

import {PanelType, PrometheusDashboardType, PrometheusWidgetId} from './types';

export function getDashboardPath(type: PrometheusDashboardType) {
    return `//sys/interface-monitoring/${type}`;
}

export function makePanelId(item: {
    gridPos: {x: number; y: number};
    type: PanelType;
}): PrometheusWidgetId {
    return `${item.gridPos.x}:${item.gridPos.y}:${item.type}`;
}

export function parseXYFromPanelId(id: PrometheusWidgetId) {
    const [x, y] = id.split(':');
    return {x: Number(x), y: Number(y)};
}

const SPECIAL_EXPR_ENV = {
    $__rate_interval: calculateRateInterval,
};

/**
 * Poor implementation of
 * https://github.com/grafana/grafana/blob/192d3783d5bede8362c1eed0c27422f431478b5a/pkg/promlib/models/query.go#L345-L366
 */
function calculateRateInterval(stepSec: number) {
    const minStep = 15000;
    return humanizeInterval(0, Math.max(stepSec * 1000 + minStep, minStep * 4));
}

export function replaceExprParams(
    expr: string,
    params: Record<string, {toString(): string}>,
    stepSec: number,
) {
    let res = formatByParamsQuotedEnv(expr, params);
    for (const k of Object.keys(SPECIAL_EXPR_ENV)) {
        const key = k as keyof typeof SPECIAL_EXPR_ENV;
        if (res.indexOf(key)) {
            res = res.replace(key, SPECIAL_EXPR_ENV[key](stepSec));
        }
    }
    return res;
}

export const minute = 60 * 1000;
export const hour = minute * 60;
export const day = hour * 24;
export const week = day * 7;
export const month = day * 30;
export const year = day * 365;

/**
 * Creates a human-readable representation of time interval
 * @param from Interval start, ms from epoch
 * @param to Interval end, ms from epoch
 * @returns Formatted string, e.g. 1d 3h
 */
export const humanizeInterval = (from: number, to: number) => {
    const duration = to - from;
    if (duration >= year) {
        const years = Math.floor(duration / year);
        const months = Math.floor((duration % year) / month);
        return months === 0 || years > 4 ? `${years}y` : `${years}y ${months}mo`;
    }
    if (duration >= month) {
        const months = Math.floor(duration / month);
        const days = Math.floor((duration % month) / day);
        return days === 0 || months > 4 ? `${months}mo` : `${months}mo ${days}d`;
    }
    if (duration >= week) {
        const weeks = Math.floor(duration / week);
        const days = Math.floor((duration % week) / day);
        return days === 0 || weeks > 3 ? `${weeks}w` : `${weeks}w ${days}d`;
    }
    if (duration >= day) {
        const days = Math.floor(duration / day);
        const hours = Math.floor((duration % day) / hour);
        return hours === 0 || days > 4 ? `${days}d` : `${days}d ${hours}h`;
    }
    if (duration >= hour) {
        const hours = Math.floor(duration / hour);
        const minutes = Math.floor((duration % hour) / minute);
        return minutes === 0 || hours > 6 ? `${hours}h` : `${hours}h ${minutes}m`;
    }
    const minutes = Math.round(duration / minute);
    return `${minutes}m`;
};
