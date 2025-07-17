import React from 'react';
import cn from 'bem-cn-lite';

import './AclUpdateMessage.scss';
import {Subject} from '../../utils/acl/acl-types';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import Link from '../../components/Link/Link';
import {AclSubject} from '../../components/AclSubject/AclSubject';
import {AppStoreProvider} from '../../containers/App/AppStoreProvider';
import i18n from './i18n';

const block = cn('acl-update-message');

interface Props {
    link: string;
    state: string;
    subject: Subject;
}

function AclUpdateMessageImpl(props: Props) {
    const {link, state, subject} = props;

    return (
        <div className={block()}>
            {i18n('role.is')}{' '}
            <Link url={link} target="_blank" className={block('link')}>
                {state}
            </Link>{' '}
            {i18n('for')}{' '}
            <span className={block('subject')}>
                <AclSubject subject={subject} />
            </span>
        </div>
    );
}

export default function AclUpdateMessage(props: Props) {
    return (
        <ErrorBoundary>
            <AppStoreProvider>
                <AclUpdateMessageImpl {...props} />
            </AppStoreProvider>
        </ErrorBoundary>
    );
}
