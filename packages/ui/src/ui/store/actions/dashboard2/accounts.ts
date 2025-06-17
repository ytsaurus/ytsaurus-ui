import {createWidgetDataFieldAction} from './utils';

export const setAccountsTypeFilter = createWidgetDataFieldAction<'favourite' | 'usable' | 'custom'>(
    'type',
);
