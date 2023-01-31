import {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.SCHEMA);

export const UPDATE_FILTER = PREFIX + 'UPDATE_FILTER';
