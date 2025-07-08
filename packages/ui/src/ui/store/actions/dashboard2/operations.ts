import {createWidgetDataFieldAction} from './utils';

export const setOperationsAuthorTypeFilter = createWidgetDataFieldAction<'me' | 'custom'>(
    'authorType',
);
export const setOperationsStateFilter = createWidgetDataFieldAction<string>('state');
