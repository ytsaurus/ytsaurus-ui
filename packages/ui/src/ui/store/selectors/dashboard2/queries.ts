import {createWidgetDataFieldSelector} from './utils';

export const getQueryFilterState = createWidgetDataFieldSelector<string | undefined>('state');
export const getQueryFilterEngine = createWidgetDataFieldSelector<string | undefined>('engine');
