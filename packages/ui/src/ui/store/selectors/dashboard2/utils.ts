import {createSelector} from '@reduxjs/toolkit';

import find_ from 'lodash/find';

import {selectDashboardConfig} from './dashboard';

export function createWidgetDataFieldSelector<T>(field: string, fallback?: T) {
    return createSelector(
        [selectDashboardConfig, (_, widgetId) => widgetId],
        (config, widgetId) => {
            const items = config.items;
            const widget = find_(items, (item) => item.id === widgetId);

            return (widget?.data?.[field] || fallback) as T;
        },
    );
}
