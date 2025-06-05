import {createWidgetDataFieldSelector} from './utils';

export const getNavigationTypeFilter = createWidgetDataFieldSelector<'last_visited' | 'favourite'>(
    'type',
    'last_visited',
);
