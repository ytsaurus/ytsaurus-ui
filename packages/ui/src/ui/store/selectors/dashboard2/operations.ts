import {createSelector} from '@reduxjs/toolkit';

import find_ from 'lodash/find';

import {getDashboardConfig} from '../../../store/selectors/dashboard2/dashboard';

export const getOperationsAuthorTypeFilter = createSelector(
    [getDashboardConfig, (_, widgetId) => widgetId],
    (config, widgetId) => {
        const items = config.items;
        const widget = find_(items, (item) => item.id === widgetId);
        return widget?.data?.authorType as 'me' | 'my-list';
    },
);

export const getOperationsStateFilter = createSelector(
    [getDashboardConfig, (_, widgetId) => widgetId],
    (config, widgetId) => {
        const items = config.items;
        const widget = find_(items, (item) => item.id === widgetId);
        return widget?.data?.state as string | undefined;
    },
);
