import {Tab} from '../../../../constants/components/main';
import createActionTypes, {createPrefix} from '../../../../constants/utils';
import {Page} from '../../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.NODES);

export const OPEN_RESOURCES_MODAL = PREFIX + 'OPEN_RESOURCES_MODAL';
export const CLOSE_RESOURCES_MODAL = PREFIX + 'CLOSE_RESOURCES_MODAL';
export const SET_RESOURCES_LIMIT = createActionTypes(PREFIX + 'SET_RESOURCES_LIMIT');
