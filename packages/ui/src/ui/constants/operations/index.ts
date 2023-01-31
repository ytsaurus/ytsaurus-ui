import createActionTypes, {createPrefix} from '../../constants/utils';
import {Page} from '../../constants/index';

const PREFIX = createPrefix(Page.OPERATIONS);
export const OPERATIONS_STATUS = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
};

export const SHOW_EDIT_WEIGHT_POOL_MODAL = PREFIX + 'SHOW_EDIT_WEIGHT_POOL_MODAL';
export const HIDE_EDIT_WEIGHT_POOL_MODAL = PREFIX + 'HIDE_EDIT_WEIGHT_POOL_MODAL';
export const SET_PULLS_AND_WEIGHTS = createActionTypes(PREFIX + 'SET_PULLS_AND_WEIGHTS');

export * from './list';
