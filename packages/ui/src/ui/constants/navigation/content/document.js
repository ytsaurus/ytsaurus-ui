import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.CONTENT, 'DOCUMENT');

export const GET_DOCUMENT = createActionTypes(PREFIX + 'GET_DOCUMENT');
export const SET_DOCUMENT_EDIT_MODE = 'NAVIGATION:CONTENT:SET_DOCUMENT_EDIT_MODE';
