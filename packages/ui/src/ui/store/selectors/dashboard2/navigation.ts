import {createWidgetDataFieldSelector} from './utils';

export const selectNavigationTypeFilter = createWidgetDataFieldSelector<
    'last_visited' | 'favourite'
>('type', 'last_visited');
