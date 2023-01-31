import createActionTypes, {createPrefix} from '../utils';
import {Page} from '../index';

const PREFIX = createPrefix(Page.NAVIGATION as 'navigation');

export const Tab = {
    AUTO: 'auto',
    CONSUMER: 'consumer',
    CONTENT: 'content',
    QUEUE: 'queue',
    ATTRIBUTES: 'attributes',
    USER_ATTRIBUTES: 'user_attributes',
    ACL: 'acl',
    LOCKS: 'locks',
    SCHEMA: 'schema',
    TABLETS: 'tablets',
    TABLET_ERRORS: 'tablet_errors',
    ANNOTATION: 'annotation',
    ACCESS_LOG: 'access_log',
    MOUNT_CONFIG: 'mount_config',
} as const;

export const ContentMode = {
    DEFAULT: 'default',
    RESOURCES: 'resources',
} as const;

export const DEFAULT_PATH = '/';

export const SET_MODE = PREFIX + 'SET_MODE';
export const SET_SELECTED_ITEM = PREFIX + 'SET_SELECTED_ITEM';
export const SELECT_ALL = PREFIX + 'SELECT_ALL';
export const SET_CONTENT_MODE = PREFIX + 'SET_CONTENT_MODE';
export const SET_TEXT_FILTER = PREFIX + 'SET_TEXT_FILTER';
export const SET_TRANSACTION = PREFIX + 'SET_TRANSACTION';
export const CLEAR_TRANSACTION = PREFIX + 'CLEAR_TRANSACTION';
export const UPDATE_PATH = PREFIX + 'UPDATE_PATH';
export const UPDATE_VIEW = createActionTypes(`${PREFIX}UPDATE_VIEW`);
export const NAVIGATION_PARTIAL = `${PREFIX}NAVIGATION_PARTIAL`;

export const FETCH_NODES = createActionTypes(`${PREFIX}FETCH_NODES`);
export const UPDATE_RESOURCE_USAGE = createActionTypes(`${PREFIX}UPDATE_RESOURCE_USAGE`);

export const NAVIGATION_MAP_NODE_TABLE_ID = 'navigation/map-nodes';
export const SET_MEDIUM_TYPE = PREFIX + 'SET_MEDIUM_TYPE';
export const APPLY_CUSTOM_SORT = PREFIX + 'APPLY_CUSTOM_SORT';
