import {createWidgetDataFieldSelector} from './utils';

export const selectServicesTypeFilter = createWidgetDataFieldSelector<'favourite' | 'custom'>(
    'type',
    'favourite',
);
