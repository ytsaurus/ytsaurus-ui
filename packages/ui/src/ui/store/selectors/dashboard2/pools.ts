import {createWidgetDataFieldSelector} from './utils';

export const selectPoolsTypeFilter = createWidgetDataFieldSelector<'favourite' | 'custom'>(
    'type',
    'favourite',
);
