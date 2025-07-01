import {createWidgetDataFieldSelector} from './utils';

export const getPoolsTypeFilter = createWidgetDataFieldSelector<'favourite' | 'custom'>(
    'type',
    'favourite',
);
