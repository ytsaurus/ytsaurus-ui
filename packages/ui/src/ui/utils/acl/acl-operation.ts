import {type YTPermissionType} from '../../../shared/yt-types';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import {internalAclWithTypes} from './acl-api';
import {type ACE, type AclFlags, type PreparedAclSubject} from './acl-types';
import {splitSubjects} from './index';

export async function getOperationAclSplitted(acl: Array<ACE & AclFlags>) {
    return internalAclWithTypes(splitSubjects(acl, {addAclIndex: true}));
}

export async function addOperationAcl({
    operation_id,
    toAdd,
}: {
    operation_id: string;
    toAdd: Array<{subjects: Array<string>; permissions: Array<YTPermissionType>}>;
}) {
    const {runtime_parameters: {acl = []} = {}} = await ytApiV3Id.getOperation(
        YTApiId.operationGetRuntimeParameters,
        {
            operation_id,
            include_scheduler: true,
            attributes: ['runtime_parameters'],
        },
    );

    toAdd.forEach(({permissions, subjects}) => {
        acl.push({
            permissions,
            subjects,
            action: 'allow',
            inheritance_mode: 'object_and_descendants',
        });
    });

    return ytApiV3Id.updateOperationParameters(YTApiId.operationUpdateRuntimeParameters, {
        operation_id,
        _parameters: {
            acl,
        },
    });
}
