import {type YTApiSetup} from '../../../rum/rum-wrap-api';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {get} from '../yt/get/endpoint';

export const ACCOUNT_EDITOR_ATTRIBUTES = [
    'abc',
    'name',
    'parent_name',
    'resource_limits',
    'resource_usage',
    'recursive_resource_usage',
    'committed_resource_usage',
    'recursive_committed_resource_usage',
    'total_children_resource_limits',
    'allow_children_limit_overcommit',
] as const;

interface AccountEditorClusterArgs {
    cluster: string;
    setup?: YTApiSetup;
}

export interface AccountEditorPathArgs extends AccountEditorClusterArgs {
    accountName: string;
}

export interface AccountEditorTreeArgs extends AccountEditorClusterArgs {
    topLevel: string;
}

export function fetchAccountEditorPath({accountName, ...args}: AccountEditorPathArgs) {
    return get<string>({
        ...args,
        id: YTApiId.accountsEditData,
        parameters: {path: `//sys/accounts/${accountName}/@path`},
    });
}

export function fetchAccountEditorTree<T>({topLevel, ...args}: AccountEditorTreeArgs) {
    return get<T>({
        ...args,
        id: YTApiId.accountsEditData,
        parameters: {
            path: `//sys/account_tree/${topLevel}`,
            attributes: [...ACCOUNT_EDITOR_ATTRIBUTES],
        },
    });
}
