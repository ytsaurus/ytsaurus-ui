import {createWidgetDataFieldSelector} from './utils';

export type QueryStatusesFilter =
    | 'draft'
    | 'running'
    | 'completed'
    | 'failed'
    | 'aborted'
    | undefined;

export const selectQueryFilterState = createWidgetDataFieldSelector<QueryStatusesFilter>('state');

export const selectQueryFilterEngine = createWidgetDataFieldSelector<string | undefined>('engine');
