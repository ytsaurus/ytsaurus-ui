import {createPrefix} from './../utils';
import createActionTypes from '../../constants/utils';
import type {ValueOf} from '../../types';

const ACCOUNTS_PREFIX = createPrefix('ACCOUNTS');

export const FETCH_ACCOUNTS_RESOURCE = createActionTypes(
    ACCOUNTS_PREFIX + 'FETCH_ACCOUNTS_RESOURCE',
);
export const FETCH_ACCOUNTS_TOTAL_USAGE = createActionTypes(
    ACCOUNTS_PREFIX + 'FETCH_ACCOUNTS_TOTAL_USAGE',
);
export const FETCH_ACCOUNTS_NODES = createActionTypes(ACCOUNTS_PREFIX + 'FETCH_ACCOUNTS_NODES');
export const FETCH_ACCOUNTS_USABLE = createActionTypes(ACCOUNTS_PREFIX + 'FETCH_ACCOUNTS_USABLE');
export const UPDATE_EDITABLE_ACCOUNT = createActionTypes(
    ACCOUNTS_PREFIX + 'UPDATE_EDITABLE_ACCOUNT',
);

export const CHANGE_NAME_FILTER = ACCOUNTS_PREFIX + 'CHANGE_NAME_FILTER';
export const CHANGE_CONTENT_MODE_FILTER = ACCOUNTS_PREFIX + 'CHANGE_CONTENT_MODE_FILTER';
export const CHANGE_MEDIUM_TYPE_FILTER = ACCOUNTS_PREFIX + 'CHANGE_MEDIUM_TYPE_FILTER';
export const FILTER_USABLE_ACCOUNTS = ACCOUNTS_PREFIX + 'FILTER_USABLE_ACCOUNTS';
export const OPEN_EDITOR_MODAL = ACCOUNTS_PREFIX + 'OPEN_EDITOR_MODAL';
export const CLOSE_EDITOR_MODAL = ACCOUNTS_PREFIX + 'CLOSE_EDITOR_MODAL';
export const ACCOUNTS_TABLE_ID = 'accounts/accounts';
export const SET_ACCOUNTS_TREE_STATE = ACCOUNTS_PREFIX + 'SET_ACCOUNTS_TREE_STATE';
export const SET_ACTIVE_ACCOUNT = ACCOUNTS_PREFIX + 'SET_ACTIVE_ACCOUNT';

export const ACCOUNTS_USAGE_SNAPSHOTS_REQUEST = 'ACCOUNTS_USAGE_SNAPSHOTS_REQUEST';
export const ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS = 'ACCOUNTS_USAGE_SNAPSHOTS_SUCCESS';
export const ACCOUNTS_USAGE_SNAPSHOTS_FAILED = 'ACCOUNTS_USAGE_SNAPSHOTS_FAILED';

export const ACCOUNTS_USAGE_LIST_REQUEST = 'ACCOUNTS_USAGE_LIST_REQUEST';
export const ACCOUNTS_USAGE_LIST_SUCCESS = 'ACCOUNTS_USAGE_LIST_SUCCESS';
export const ACCOUNTS_USAGE_LIST_FAILED = 'ACCOUNTS_USAGE_LIST_FAILED';

export const ACCOUNTS_USAGE_LIST_DIFF_REQUEST = 'ACCOUNTS_USAGE_LIST_DIFF_REQUEST';
export const ACCOUNTS_USAGE_LIST_DIFF_SUCCESS = 'ACCOUNTS_USAGE_LIST_DIFF_SUCCESS';
export const ACCOUNTS_USAGE_LIST_DIFF_FAILED = 'ACCOUNTS_USAGE_LIST_DIFF_FAILED';

export const ACCOUNTS_USAGE_TREE_REQUEST = 'ACCOUNTS_USAGE_TREE_REQUEST';
export const ACCOUNTS_USAGE_TREE_SUCCESS = 'ACCOUNTS_USAGE_TREE_SUCCESS';
export const ACCOUNTS_USAGE_TREE_FAILED = 'ACCOUNTS_USAGE_TREE_FAILED';

export const ACCOUNTS_USAGE_TREE_DIFF_REQUEST = 'ACCOUNTS_USAGE_TREE_DIFF_REQUEST';
export const ACCOUNTS_USAGE_TREE_DIFF_SUCCESS = 'ACCOUNTS_USAGE_TREE_DIFF_SUCCESS';
export const ACCOUNTS_USAGE_TREE_DIFF_FAILED = 'ACCOUNTS_USAGE_TREE_DIFF_FAILED';

export const ACCOUNTS_USAGE_FILTERS_PARTIAL = 'ACCOUNTS_USAGE_FILTERS_PARTIAL';

export const AccountsTab = {
    GENERAL: 'general',
    STATISTICS: 'statistics',
    MONITOR: 'monitor',
    USAGE: 'usage',
    ACL: 'acl',
};

export const ACCOUNTS_ALLOWED_ROOT_TABS = {
    [AccountsTab.GENERAL]: true,
};

export const ACCOUNTS_DEFAULT_TAB = AccountsTab.GENERAL;

export const ROOT_ACCOUNT_NAME = 'root';

export const AccountResourceName = {
    DISK_SPACE_PER_MEDIUM: 'disk_space_per_medium' as const,
    NODE_COUNT: 'node_count' as const,
    CHUNK_COUNT: 'chunk_count' as const,
    TABLET_COUNT: 'tablet_count' as const,
    TABLET_STATIC_MEMORY: 'tablet_static_memory' as const,
    MASTER_MEMORY: 'master_memory' as const,
};

export type AccountResourceNameType = ValueOf<typeof AccountResourceName>;

type AccountSelector = any;

export interface AccountResourceInfo {
    committed: number;
    uncommitted: number;
    total: number;
    limit: number;
    theme: string;
    progress: number;
    progressText: string;
}

export const ACCOUNT_RESOURCE_TYPES_DESCRIPTION = {
    [AccountResourceName.DISK_SPACE_PER_MEDIUM]: {
        format: 'Bytes' as const,
        getInfo: (
            account: AccountSelector,
            recursive?: boolean,
            mediumType?: string,
        ): AccountResourceInfo => {
            return account?.getDiskSpaceProgressInfo(mediumType, recursive) || {};
        },
    },
    [AccountResourceName.NODE_COUNT]: {
        format: 'Number' as const,
        getInfo: (account: AccountSelector, recursive?: boolean): AccountResourceInfo => {
            return account?.getNodeCountProgressInfo(recursive) || {};
        },
    },
    [AccountResourceName.CHUNK_COUNT]: {
        format: 'Number' as const,
        getInfo: (account: AccountSelector, recursive?: boolean): AccountResourceInfo => {
            return account?.getChunkCountProgressInfo(recursive) || {};
        },
    },
    [AccountResourceName.TABLET_COUNT]: {
        format: 'Number' as const,
        getInfo: (account: AccountSelector, recursive?: boolean): AccountResourceInfo => {
            return account?.getTabletCountProgressInfo(recursive) || {};
        },
    },
    [AccountResourceName.TABLET_STATIC_MEMORY]: {
        format: 'Bytes' as const,
        getInfo: (account: AccountSelector, recursive?: boolean): AccountResourceInfo => {
            return account?.getTabletStaticMemoryInfo(recursive) || {};
        },
    },
    [AccountResourceName.MASTER_MEMORY]: {
        format: 'Bytes' as const,
        getInfo: (
            account: AccountSelector,
            recursive?: boolean,
            mediumType?: string,
        ): AccountResourceInfo => {
            return account?.getMasterMemoryMediumInfo(recursive, mediumType) || {};
        },
    },
};
