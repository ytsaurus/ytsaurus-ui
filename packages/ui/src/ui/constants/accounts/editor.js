import createActionTypes, {createPrefix} from './../utils';

const ACCOUNTS_EDITOR_PREFIX = createPrefix('ACCOUNTS_NEW_EDITOR');

export const FETCH_USERS = createActionTypes(ACCOUNTS_EDITOR_PREFIX + 'FETCH_USERS');
export const CHANGE_USER_SUGGEST_LIST = ACCOUNTS_EDITOR_PREFIX + 'CHANGE_USER_SUGGEST_LIST';
export const CLOSE_CREATE_MODAL = ACCOUNTS_EDITOR_PREFIX + 'CLOSE_CREATE_MODAL';
export const OPEN_CREATE_MODAL = ACCOUNTS_EDITOR_PREFIX + 'OPEN_CREATE_MODAL';

export const EDITOR_TABS = {
    general: 'general',
    medium: 'disk_space',
    nodes: 'nodes',
    chunks: 'chunks',
    tablets: 'tablets',
    masterMemory: 'master_memory',
    delete: 'delete',
};
