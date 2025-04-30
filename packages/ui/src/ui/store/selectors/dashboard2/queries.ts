import {createSelector} from '@reduxjs/toolkit';

import find_ from 'lodash/find';

import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';

export const getSettingQueryFilterState = createSelector(
    [getDashboardConfig, (_, widgetId) => widgetId],
    (config, widgetId) => {
        const items = config.items;
        const widget = find_(items, (item) => item.id === widgetId);
        return widget?.data?.state as string | undefined;
    },
);

export const getSettingQueryFilterEngine = createSelector(
    [getDashboardConfig, (_, widgetId) => widgetId],
    (config, widgetId) => {
        const items = config.items;
        const widget = find_(items, (item) => item.id === widgetId);
        return widget?.data?.engine as string | undefined;
    },
);
