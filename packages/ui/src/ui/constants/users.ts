import createActionTypes, {createPrefix} from './utils';

const PREFIX = createPrefix('USERS');

const USERS_DATA = `${PREFIX}USERS_DATA` as const;
const USERS_EDIT_USER_TYPE = `${PREFIX}USERS_EDIT_USER` as const;

export const USERS_TABLE = createActionTypes(USERS_DATA);
export const USERS_TABLE_DATA_FIELDS = `${PREFIX}USERS_TABLE_DATA_FIELDS` as const;

export const USERS_EDIT_USER = createActionTypes(USERS_EDIT_USER_TYPE);
export const USERS_EDIT_USER_DATA_FIELDS = `${PREFIX}USERS_EDIT_USER_DATA_FIELDS` as const;
