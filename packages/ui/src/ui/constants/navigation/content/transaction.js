import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.CONTENT, 'TRANSACTION');

export const ABORT_TRANSACTION = createActionTypes(PREFIX + 'ABORT_TRANSACTION');
