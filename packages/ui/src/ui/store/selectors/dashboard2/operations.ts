import {createWidgetDataFieldSelector} from './utils';

export const getOperationsStateFilter = createWidgetDataFieldSelector<string>('state', 'all');
export const getOperationsAuthorTypeFilter = createWidgetDataFieldSelector<'me' | 'custom'>(
    'authorType',
    'me',
);
