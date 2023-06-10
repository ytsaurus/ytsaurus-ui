import _ from 'lodash';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import UIFactory from '../../UIFactory';
import {
    ACE,
    ACLResponsible,
    GetAclParams,
    GetResponsibleParams,
    IdmKindType,
    PreparedAclSubject,
    UpdateAclParams,
    UpdateResponse,
} from './acl-types';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../rum/rum-wrap-api';
import {getBatchError, splitBatchResults} from '../../utils/utils';
import {convertFromUIPermission, convertToUIPermissions} from '.';
import {BatchResultsItem, ExecuteBatchParams} from '../../../shared/yt-types';
import {RequestPermissionParams} from './external-acl-api';
import {PERMISSIONS_SETTINGS} from '../../constants/acl';

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
    if (useEffective) {
        return getEffectiveAcl(sysPath);
    }
    return api.getAcl({cluster, path, kind, poolTree, sysPath});
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
                permissions: data.map(convertToUIPermissions),
            };
        });
    });
};

export const getCombinedAcl = (sysPath: string) => {
    return ytApiV3
        .executeBatch<string>({
            requests: [
                {command: 'get', parameters: {path: sysPath + '/@effective_acl'}},
                {command: 'get', parameters: {path: sysPath + '/@acl'}},
                {command: 'get', parameters: {path: sysPath + '/@revision'}},
            ],
        })
        .then((results: Array<any>) => {
            const error = getBatchError(results, 'Failed to load combined acl list');
            if (error) {
                throw error;
            }
            const [{output: effective_acl}, {output: acl}, {output: revision}] = results;
            const effective_acl_dif = _.filter(
                effective_acl,
                (e_item) => !_.some(acl, (a_item) => _.isEqual(a_item, e_item)),
            );
            return [
                ...effective_acl_dif.map((e_item) => ({
                    inherited: true,
                    ...e_item,
                })),
                ...(acl as any[]).map((a_item, index) => ({
                    aclIndex: index,
                    revision,
                    ...a_item,
                })),
            ];
        })
        .then((items) => {
            return internalAclWithTypes(items).then((data) => {
                return {
                    permissions: data.map(convertToUIPermissions),
                    column_groups: [],
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
            parameters: Object.assign(
                {path, user},
                convertFromUIPermission(permission),
                tx ? {transaction_id: tx} : {},
            ),
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

export function requestPermissions(params: RequestPermissionParams): Promise<UpdateResponse> {
    const {roles_grouped, sysPath} = params;
    const batchParams: ExecuteBatchParams = {
        requests: roles_grouped.map(({permissions, subject, inheritance_mode}) => {
            return {
                command: 'set',
                parameters: {path: `${sysPath}/@acl/end`},
                input: {
                    action: 'allow',
                    inheritance_mode: inheritance_mode,
                    permissions: permissions,
                    subjects: Object.values(subject),
                },
            };
        }),
    };
    return yt.v3.executeBatch(batchParams).then((results: BatchResultsItem<unknown>[]) => {
        const error = getBatchError(results);
        if (error) {
            throw error;
        }
        return results;
    });
}

export function updateAclAttributes(_cluster: string, path: string, params: UpdateAclParams) {
    const {inheritAcl} = params;
    const batchParams = {
        requests: [
            {
                command: 'set',
                parameters: {path: `${path}/@inherit_acl`},
                input: inheritAcl,
            },
        ],
    };
    return yt.v3.executeBatch(batchParams).then((results: BatchResultsItem<unknown>[]) => {
        const error = getBatchError(results);
        if (error) {
            throw error;
        }
        window.location.reload();
        return results;
    });
}

export function deleteAclItemOrSubjectByIndex(params: {
    sysPath: string;
    itemToDelete: PreparedAclSubject;
    idmKind: IdmKindType;
}) {
    const {sysPath, itemToDelete, idmKind} = params;
    const {revision, aclIndex, isSplitted, subjectIndex} = itemToDelete;
    const allowUnsafeDelete = PERMISSIONS_SETTINGS[idmKind].allowDeleteWithoutRevisionCheck;
    if (isSplitted) {
        return yt.v3.remove({
            path: `${sysPath}/@acl/${aclIndex}/subjects/${subjectIndex}`,
            ...(allowUnsafeDelete ? {} : {prerequisite_revisions: [{revision, path: sysPath}]}),
        });
    }
    return yt.v3.remove({
        path: `${sysPath}/@acl/${aclIndex}`,
        ...(allowUnsafeDelete ? {} : {prerequisite_revisions: [{revision, path: sysPath}]}),
    });
}
