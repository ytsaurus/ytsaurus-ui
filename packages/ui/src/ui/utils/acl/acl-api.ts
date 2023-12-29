import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import some_ from 'lodash/some';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import UIFactory from '../../UIFactory';
import {
    ACE,
    ACLResponsible,
    ACLType,
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
import {
    BatchResultsItem,
    BatchSubRequest,
    ExecuteBatchParams,
    YTPermissionType,
} from '../../../shared/yt-types';
import {
    CheckPermissionItem,
    makeCheckPermissionBatchSubRequest,
} from '../../../shared/utils/check-permission';
import {RequestPermissionParams} from './external-acl-api';
import {REGISTER_QUEUE_CONSUMER_VITAL} from '../../constants/acl';

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
    aclType,
    useEffective = false,
}: GetAclParams) {
    const api = UIFactory.getAclApi();
    if (useEffective) {
        return getEffectiveAcl(sysPath);
    }
    return api.getAcl({cluster, path, kind, poolTree, sysPath, aclType});
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
    const allSubjects = reduce_(
        items,
        (acc, item) => {
            forEach_(item.subjects, (subject) => acc.add(subject));
            return acc;
        },
        new Set<string>(),
    );

    const requests = map_([...allSubjects], (group) => {
        return {command: 'get' as const, parameters: {path: `//sys/groups/${group}/@name`}};
    });

    return ytApiV3.executeBatch<string>({requests}).then((data) => {
        const {results} = splitBatchResults(data);
        const groups = new Set(results);
        return map_(items, (item) => {
            return {
                ...item,
                inherited: Boolean(item.inherited),
                internal: true,
                types: map_(item.subjects, (subject) => (groups.has(subject) ? 'group' : 'user')),
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

export const getCombinedAcl = ({sysPath, aclType}: {sysPath: string; aclType: ACLType}) => {
    const isPrincipalAcl = aclType === '@principal_acl';

    return ytApiV3
        .executeBatch<string>({
            requests: [
                {command: 'get', parameters: {path: sysPath + '/@effective_acl'}},
                {command: 'get', parameters: {path: sysPath + `/${aclType}`}},
                {command: 'get', parameters: {path: sysPath + '/@revision'}},
            ],
        })
        .then((results: Array<any>) => {
            const error = getBatchError(results, 'Failed to load combined acl list');
            if (error) {
                throw error;
            }

            const [{output: effective_acl}, {output: acl}, {output: revision}] = results;
            const effective_acl_dif = filter_(
                effective_acl,
                (e_item) => !some_(acl, (a_item) => isEqual_(a_item, e_item)),
            );

            return [
                ...(isPrincipalAcl
                    ? []
                    : effective_acl_dif.map((e_item) => ({
                          inherited: true,
                          ...e_item,
                      }))),
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
    permissionTypes: Array<YTPermissionType>,
): Promise<CheckPermissionResult[]> => {
    const items = map_(permissionTypes, (permission) => {
        return {path, user, permission};
    });

    return checkPermissions(items);
};

export type CheckPermissionItemUI = Omit<CheckPermissionItem, 'permission'> & {
    permission: YTPermissionType | typeof REGISTER_QUEUE_CONSUMER_VITAL;
};

export function makeCheckPermissionBatchSubRequestUI({
    path,
    user,
    permission: uiPermission,
    transaction_id,
}: CheckPermissionItemUI): BatchSubRequest {
    const convertedPermission = convertFromUIPermission(uiPermission);
    return makeCheckPermissionBatchSubRequest({path, user, ...convertedPermission, transaction_id});
}

export function checkPermissions(
    arr: Array<CheckPermissionItem>,
    ytApiId?: YTApiId,
): Promise<CheckPermissionResult[]> {
    const requests = map_(arr, makeCheckPermissionBatchSubRequestUI);

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
    const {roles_grouped, sysPath, aclType} = params;
    const batchParams: ExecuteBatchParams = {
        requests: roles_grouped.map(({permissions, subject, inheritance_mode}) => {
            return {
                command: 'set',
                parameters: {path: `${sysPath}/${aclType}/end`},
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
    aclType: ACLType;
}) {
    const {sysPath, itemToDelete, idmKind, aclType} = params;
    const {revision, aclIndex, isSplitted, subjectIndex} = itemToDelete;
    const allowUnsafeDelete =
        UIFactory.getAclPermissionsSettings()[idmKind].allowDeleteWithoutRevisionCheck;

    if (isSplitted) {
        return yt.v3.remove({
            path: `${sysPath}/${aclType}/${aclIndex}/subjects/${subjectIndex}`,
            ...(allowUnsafeDelete ? {} : {prerequisite_revisions: [{revision, path: sysPath}]}),
        });
    }
    return yt.v3.remove({
        path: `${sysPath}/${aclType}/${aclIndex}`,
        ...(allowUnsafeDelete ? {} : {prerequisite_revisions: [{revision, path: sysPath}]}),
    });
}
