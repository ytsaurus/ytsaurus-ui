import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.USER_ATTRIBUTES);

export const GET_USER_ATTRIBUTE_KEYS = createActionTypes(PREFIX + 'GET_USER_ATTRIBUTE_KEYS');
