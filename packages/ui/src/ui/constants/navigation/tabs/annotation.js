import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.ANNOTATION);

export const GET_ANNOTATION = createActionTypes(PREFIX + 'GET_ANNOTATION');
