import {createWidgetDataFieldAction} from './utils';

export const setNavigationTypeFilter = createWidgetDataFieldAction<'last_visited' | 'favourite'>(
    'type',
);
