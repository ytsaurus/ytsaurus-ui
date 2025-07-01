import {createWidgetDataFieldSelector} from './utils';

export const getServicesTypeFilter = createWidgetDataFieldSelector<'favourite' | 'custom'>(
    'type',
    'favourite',
);
