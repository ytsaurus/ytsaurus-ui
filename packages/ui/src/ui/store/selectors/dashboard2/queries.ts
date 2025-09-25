import {createWidgetDataFieldSelector} from './utils';

export type QueryStatusesFilter =
    | 'draft'
    | 'running'
    | 'completed'
    | 'failed'
    | 'aborted'
    | undefined;

export const getQueryFilterState = createWidgetDataFieldSelector<QueryStatusesFilter>('state');
export const getQueryFilterEngine = createWidgetDataFieldSelector<string | undefined>('engine');
