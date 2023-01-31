import createActionTypes, {createPrefix} from '../constants/utils';

const PREFIX = createPrefix('GROUPS');

export const GROUPS_TABLE = createActionTypes(PREFIX + 'GROUPS_TABLE');
export const GROUPS_TABLE_DATA_FIELDS = PREFIX + 'GROUPS_TABLE_DATA_FIELDS';

export const GROUPS_TABLE_UPDATER_ID = 'GROUPS_TABLE_UPDATER_ID';

export const ROOT_GROUP_NAME = '<Root>';

export const GROUP_EDITOR_ACTION = createActionTypes(PREFIX + 'GROUP_EDITOR_ACTION');
export const GROUP_EDITOR_ACTION_DATA_FIELDS = PREFIX + 'GROUP_EDITOR_ACTION_DATA_FIELDS';
