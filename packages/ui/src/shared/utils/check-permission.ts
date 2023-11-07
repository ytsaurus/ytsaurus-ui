import {FIX_MY_TYPE} from '../../@types/types';
import {BatchResultsItem, BatchSubRequest, YTPermissionType} from '../yt-types';

const yt = require('@ytsaurus/javascript-wrapper')();

export function prepareCheckIsDeveloperRequests(login: string) {
    const [first] = prepareCheckUserPermissionByAclRequests('admins', login, ['write']);
    return [first];
}

function prepareCheckUserPermissionByAclRequests(
    groupName: string,
    user: string,
    permissionTypes: Array<YTPermissionType>,
) {
    return permissionTypes.map((permission) => {
        return {
            command: 'check_permission_by_acl' as const,
            parameters: {
                acl: [
                    {
                        permissions: [permission],
                        subjects: [groupName],
                        action: 'allow' as const,
                    },
                ],
                user,
                permission,
            },
        };
    });
}

function checkUserPermissionByAcl(
    groupName: string,
    user: string,
    permissionTypes: Array<YTPermissionType>,
    setup: FIX_MY_TYPE = undefined,
) {
    // $ yt --proxy cluster_proxy execute check_permission_by_acl \
    //   '{acl=[{permissions=[write]; subjects=[yt;admins]; action=allow}]; user=max42; permission=write}'
    const requests = prepareCheckUserPermissionByAclRequests(groupName, user, permissionTypes);

    return yt.v3.executeBatch({
        setup,
        parameters: {requests},
    }) as Promise<Array<BatchResultsItem<CheckPermissionItemResult>>>;
}

export function checkIsDeveloper(login: string, setup: FIX_MY_TYPE = undefined) {
    return checkUserPermissionByAcl('admins', login, ['write'], setup)
        .then((d) => {
            const {output} = d[0];
            return output?.action === 'allow';
        })
        .catch(() => {
            return false;
        });
}

export type CheckPermissionItem = {
    user: string;
    path: string;
    permission: YTPermissionType;
    transaction_id?: string;
    vital?: boolean;
};

export type CheckPermissionItemResult = {
    action: 'allow' | 'deny';
};

export function makeCheckPermissionBatchSubRequest({
    path,
    user,
    permission,
    transaction_id,
    vital,
}: CheckPermissionItem): BatchSubRequest {
    const result: BatchSubRequest = {
        command: 'check_permission' as const,
        parameters: {
            path,
            user,
            permission,
            ...(transaction_id ? {transaction_id} : {}),
            ...(vital ? {vital} : {}),
        },
    };
    return result;
}
