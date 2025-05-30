import {createWidgetDataFieldAction} from './utils';

export const setOperationsAuthorTypeFilter = createWidgetDataFieldAction<'me' | 'my-list'>(
    'authorType',
);
export const setOperationsStateFilter = createWidgetDataFieldAction<string>('state');
