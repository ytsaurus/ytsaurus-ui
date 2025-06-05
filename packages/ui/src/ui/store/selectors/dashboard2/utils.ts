import {createSelector} from '@reduxjs/toolkit';

import find_ from 'lodash/find';

import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';

export function createWidgetDataFieldSelector<T>(field: string, fallback?: T) {
    return createSelector([getDashboardConfig, (_, widgetId) => widgetId], (config, widgetId) => {
        const items = config.items;
        const widget = find_(items, (item) => item.id === widgetId);
        return (widget?.data?.[field] || fallback) as T;
    });
}
