import {createWidgetDataFieldSelector} from './utils';

export const getOperationsStateFilter = createWidgetDataFieldSelector<string | undefined>('state');
export const getOperationsAuthorTypeFilter = createWidgetDataFieldSelector<'me' | 'my-list'>(
    'authorType',
);
