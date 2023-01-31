import _ from 'lodash';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import UIFactory from '../../UIFactory';
import {
    ACE,
    ACLResponsible,
    GetAclParams,
    GetResponsibleParams,
    UpdateAclParams,
} from './acl-types';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../rum/rum-wrap-api';
import {splitBatchResults} from '../../utils/utils';
import {BatchResultsItem} from '../../../shared/yt-types';

function getInheritAcl(path: string): Promise<ACLResponsible> {
    return yt.v3.get({path: path + '/@inherit_acl'}).then((inherit_acl: boolean) => {
        return {
            disableAclInheritance: !inherit_acl,
        };
    });
}

export function getAcl({
    cluster,
    path,
    kind,
    poolTree,
    sysPath,
    useEffective = false,
}: GetAclParams) {
    const api = UIFactory.getAclApi();
    if (useEffective || !api.isAllowed) {
        return getEffectiveAcl(sysPath);
    }
    return api.getAcl({cluster, path, kind, poolTree});
}

export function updateAcl(cluster: string, path: string, params: UpdateAclParams) {
    const api = UIFactory.getAclApi();
    if (!api.isAllowed) {
        return Promise.resolve();
    }

    return api.updateAcl(cluster, path, params);
}

export const getResponsible = async ({
    cluster,
    path,
    kind,
    poolTree,
    sysPath,
    skipResponsible = false,
}: GetResponsibleParams): Promise<ACLResponsible> => {
    const api = UIFactory.getAclApi();
    if (skipResponsible || !api.isAllowed) {
        return getInheritAcl(sysPath);
    }

    return api.getResponsible({cluster, path, kind, poolTree});
};

export function internalAclWithTypes(items: Array<ACE>) {
    const allSubjects = _.reduce(
        items,
        (acc, item) => {
            _.forEach(item.subjects, (subject) => acc.add(subject));
            return acc;
        },
        new Set<string>(),
    );

    const requests = _.map([...allSubjects], (group) => {
        return {command: 'get' as const, parameters: {path: `//sys/groups/${group}/@name`}};
    });

    return ytApiV3.executeBatch<string>({requests}).then((data) => {
        const {results} = splitBatchResults(data);
        const groups = new Set(results);
        return _.map(items, (item) => {
            return {
                ...item,
                inherited: Boolean(item.inherited),
                internal: true,
                types: _.map(item.subjects, (subject) => (groups.has(subject) ? 'group' : 'user')),
            };
        });
    });
}

export const getEffectiveAcl = (sysPath: string) => {
    return yt.v3.get({path: sysPath + '/@effective_acl'}).then((items: Array<ACE>) => {
        return internalAclWithTypes(items).then((data) => {
            return {
                permissions: data,
            };
        });
    });
};

export interface CheckPermissionResult {
    action: 'allow' | 'deny';
}

export const checkUserPermissions = (
    path: string,
    user: string,
    permissionTypes: Array<string>,
): Promise<CheckPermissionResult[]> => {
    const items: CheckPermissionItem[] = _.map(permissionTypes, (permission) => {
        return {path, user, permission};
    });

    return checkPermissions(items);
};

export interface CheckPermissionItem {
    user: string;
    path: string;
    permission: string;
    transaction_id?: string;
}

export function checkPermissions(
    arr: Array<CheckPermissionItem>,
    ytApiId?: YTApiId,
): Promise<CheckPermissionResult[]> {
    const requests = _.map(arr, ({path, user, permission, transaction_id: tx}) => {
        return {
            command: 'check_permission' as const,
            parameters: Object.assign({path, user, permission}, tx ? {transaction_id: tx} : {}),
        };
    });

    return ytApiV3Id
        .executeBatch(ytApiId ?? YTApiId.checkPermissions, {requests})
        .then((data: Array<BatchResultsItem<CheckPermissionResult>>) => {
            const {error, results} = splitBatchResults(data);
            if (error) {
                return Promise.reject(error);
            }
            return results;
        });
}
