import isEqual_ from 'lodash/isEqual';
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

export async function removeOperationAcl({
    operation_id,
    item,
}: {
    operation_id: string;
    item: PreparedAclSubject;
}) {
    const {runtime_parameters: {acl = []} = {}} = await ytApiV3Id.getOperation(
        YTApiId.operationGetRuntimeParameters,
        {
            operation_id,
            include_scheduler: true,
            attributes: ['runtime_parameters'],
        },
    );

    const {aclIndex = -1, subjectIndex = -1} = item;
    const toRemove = acl[aclIndex];

    if (!toRemove || !isEqual(item, toRemove)) {
        throw new Error('Item to remove not found');
    }

    if (subjectIndex >= 0) {
        acl[aclIndex].subjects.splice(subjectIndex, 1);
    } else {
        acl.splice(aclIndex, 1);
    }

    return ytApiV3Id.updateOperationParameters(YTApiId.operationUpdateRuntimeParameters, {
        operation_id,
        _parameters: {
            acl,
        },
    });
}

function isEqual(item: PreparedAclSubject, ace: ACE) {
    function pickFields({
        action,
        permissions,
        inheritance_mode,
        subjects,
    }: Partial<Record<'permissions' | 'inheritance_mode' | 'subjects' | 'action', unknown>>) {
        return {action, permissions, inheritance_mode, subjects};
    }

    const {subjects, subjectIndex = -1} = item;
    if (subjectIndex >= 0) {
        return isEqual_(
            {...pickFields(item), subjects: [subjects[subjectIndex]]},
            {...pickFields(ace), subjects: [ace.subjects[subjectIndex]]},
        );
    }

    return isEqual_(pickFields(item), pickFields(ace));
}
