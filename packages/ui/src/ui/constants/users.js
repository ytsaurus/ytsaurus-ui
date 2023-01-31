import createActionTypes, {createPrefix} from '../constants/utils';

const PREFIX = createPrefix('USERS');

export const USERS_TABLE = createActionTypes(PREFIX + 'USERS_DATA');
export const USERS_TABLE_DATA_FIELDS = PREFIX + 'USERS_TABLE_DATA_FIELDS';

export const USERS_EDIT_USER = createActionTypes(PREFIX + 'USERS_EDIT_USER');
export const USERS_EDIT_USER_DATA_FIELDS = PREFIX + 'USERS_EDIT_USER_DATA_FIELDS';

export const USERS_UPDATER_ID = 'USERS_UPDATER_ID';
