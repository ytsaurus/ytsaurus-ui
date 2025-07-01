import {createWidgetDataFieldAction} from './utils';

export const setServicesTypeFilter = createWidgetDataFieldAction<'favourite' | 'custom'>('type');
