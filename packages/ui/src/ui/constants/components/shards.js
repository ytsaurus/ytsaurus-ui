import createActionTypes, {createPrefix} from '../../constants/utils';
import {Page} from '../../constants/index';
import {Tab} from './main';

const PREFIX = createPrefix(Page.COMPONENTS, Tab.SHARDS);

export const GET_SHARDS = createActionTypes(PREFIX + 'GET_SHARDS');
export const SET_SHARD_NAME = createActionTypes(PREFIX + 'SET_SHARD_NAME');
export const OPEN_SHARD_NAME_EDITOR = PREFIX + 'OPEN_SHARD_NAME_EDITOR';
export const CLOSE_SHARD_NAME_EDITOR = PREFIX + 'CLOSE_SHARD_NAME_EDITOR';
