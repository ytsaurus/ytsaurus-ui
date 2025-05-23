import {createWidgetDataFieldAction} from './utils';

export const setQueryEngineFilter = createWidgetDataFieldAction<string>('engine');
export const setQueryStateFilter = createWidgetDataFieldAction<string>('state');
