import createActionTypes, {createPrefix} from '../../../../constants/utils';
import {Tab} from '../../../../constants/components/main';
import {Page} from '../../../../constants/index';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.HTTP_PROXIES);

export const OPEN_CHANGE_ROLE_MODAL = PREFIX + 'OPEN_CHANGE_ROLE_MODAL';
export const CLOSE_CHANGE_ROLE_MODAL = PREFIX + 'CLOSE_CHANGE_ROLE_MODAL';
export const CHANGE_ROLE = createActionTypes(PREFIX + 'CHANGE_ROLE');
