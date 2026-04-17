import {createWidgetDataFieldSelector} from './utils';

export const selectOperationsStateFilter = createWidgetDataFieldSelector<string>('state', 'all');

export const selectOperationsAuthorTypeFilter = createWidgetDataFieldSelector<'me' | 'custom'>(
    'authorType',
    'me',
);
