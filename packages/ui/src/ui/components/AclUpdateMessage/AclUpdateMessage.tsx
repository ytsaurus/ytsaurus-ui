import React from 'react';
import cn from 'bem-cn-lite';

import './AclUpdateMessage.scss';
import {Subject} from '../../utils/acl/acl-types';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import Link from '../../components/Link/Link';
import Tag from '../../components/Tag/Tag';

const block = cn('acl-update-message');

interface Props {
    link: string;
    state: string;
    subject: Subject;
}

function FormattedSubject(subject: Subject) {
    if ('group' in subject) {
        return <Tag asUsername text={`group ${subject.group}`} />;
    }

    if ('tvm_id' in subject) {
        return <Tag asUsername text={`tvm ${subject.tvm_id}`} />;
    }

    return <Tag asUsername text={subject.user} />;
}

function AclUpdateMessageImpl(props: Props) {
    const {link, state, subject} = props;

    return (
        <div className={block()}>
            Role is
            <span className={block('link')}>
                <Link url={link} target="_blank">
                    {state}
                </Link>
            </span>
            for{' '}
            <div className={block('subject')}>
                <FormattedSubject {...subject} />
            </div>
            .
        </div>
    );
}

export default function AclUpdateMessage(props: Props) {
    return (
        <ErrorBoundary>
            <AclUpdateMessageImpl {...props} />
        </ErrorBoundary>
    );
}
