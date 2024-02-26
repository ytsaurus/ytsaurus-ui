import createActionTypes, {createPrefix} from '../../utils';
import {Page} from '../../index';
import {Tab} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION, Tab.ANNOTATION);

export const GET_ANNOTATION = createActionTypes(PREFIX + 'GET_ANNOTATION');

export const SET_ANNOTATION = 'NAVIGATION:ANNOTATION:SET_ANNOTATION';
export const SET_ANNOTATION_SAVING = 'NAVIGATION:ANNOTATION:SET_ANNOTATION_SAVING';
export const SET_ANNOTATION_EDITING = 'NAVIGATION:ANNOTATION:SET_ANNOTATION_EDITING';
