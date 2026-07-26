import isEqual_ from 'lodash/isEqual';
import {type YTPermissionType} from '../../../shared/yt-types';
import {SubjectCardProps} from '../../components/SubjectLink/SubjectLink';
import {YTApiId, ytApiV3Id} from '../../rum/rum-wrap-api';
import UIFactory from '../../UIFactory';
import {internalAclWithTypes} from './acl-api';
import {TypedAclSubject, type ACE, type AclFlags, type PreparedAclSubject} from './acl-types';
import {splitSubjects} from './index';

export async function getOperationAclSplitted(cluster: string, acl: Array<ACE & AclFlags>) {
    return internalAclWithTypes(acl).then(async (acl) => {
        const subjects = acl.reduce(
            (acc, item) => {
                item.subjects.forEach((s, index) => {
                    const type = item.types[index];
                    acc.push({name: s, type});
                });
                return acc;
            },
            [] as Array<Pick<SubjectCardProps, 'name' | 'type'>>,
        );

        const titles = await UIFactory.fetchSubejectNames({cluster, subjects});
        return splitSubjects(acl, {addAclIndex: true}).map((item) => {
            const {title, url, internal, isTvm} = titles.get(item.subjects[0]) ?? {};

            if (!title) {
                return item;
            }

            const {
                subjects: [subject],
                types: [type],
            } = item;
            let aclSubject: TypedAclSubject;
            if (isTvm) {
                aclSubject = {subjectType: 'tvm', tvmInfo: {name: title}, subjectUrl: url};
            } else if (type === 'group') {
                aclSubject = {
                    subjectType: 'group',
                    groupInfo: {name: title, group: subject, url},
                };
            } else {
                aclSubject = {subjectType: 'user', subjectUrl: url};
            }
            return {
                ...item,
                ...aclSubject,
                internal: internal ?? item.internal,
            };
        });
    });
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
