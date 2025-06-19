import {createWidgetDataFieldSelector} from './utils';

export const getAccountsTypeFilter = createWidgetDataFieldSelector<
    'favourite' | 'usable' | 'custom'
>('type', 'favourite');
