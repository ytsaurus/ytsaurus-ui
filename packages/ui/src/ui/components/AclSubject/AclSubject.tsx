import React from 'react';

import {SubjectCard} from '../../components/SubjectLink/SubjectLink';
import {Subject} from '../../utils/acl/acl-types';

export type AclSubjectProps = {
    subject: Subject;
    showIcon?: boolean;
};

export function AclSubject({subject, ...rest}: AclSubjectProps) {
    if ('user' in subject) {
        const {url, user} = subject;

        return <SubjectCard {...rest} url={url} name={user} type="user" />;
    }

    if ('tvm_id' in subject) {
        const {tvm_id, tvm_app_name, url} = subject;

        const text = `${tvm_app_name} (${tvm_id})`;
        return <SubjectCard {...rest} url={url} name={text} type="tvm" />;
    }

    const {group, group_type, group_name, url} = subject;
    return (
        <SubjectCard
            {...rest}
            name={group_name ?? group}
            url={url}
            type="group"
            groupType={group_type}
        />
    );
}
