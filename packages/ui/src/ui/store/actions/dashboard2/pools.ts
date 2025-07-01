import {createWidgetDataFieldAction} from './utils';

export const setPoolsTypeFilter = createWidgetDataFieldAction<'favourite' | 'custom'>('type');
