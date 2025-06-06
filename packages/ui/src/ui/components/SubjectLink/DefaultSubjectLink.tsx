import React from 'react';
import cn from 'bem-cn-lite';

import {Icon} from '@gravity-ui/uikit';

import {YT} from '../../config/yt-config';

import userSvg from '../../assets/img/svg/page-users.svg';
import groupSvg from '../../assets/img/svg/page-groups.svg';

import type {SubjectCardProps} from './SubjectLink';
export {SubjectCardProps};

import './DefaultSubjectLink.scss';

const block = cn('yt-subject-link');

function makeUrl(type: SubjectCardProps['type'], name: SubjectCardProps['name']) {
    switch (type) {
        case 'user':
            return `/${YT.cluster}/users?filter=${name}`;
        case 'group':
            return `/${YT.cluster}/groups?groupFilter=${name}`;
        default:
            return undefined;
    }
}

export function makeSubjectIcon(type: SubjectCardProps['type']) {
    switch (type) {
        case 'user':
            return <Icon className={block('icon-svg')} size={16} data={userSvg} />;
        case 'group':
            return <Icon className={block('icon-svg')} size={16} data={groupSvg} />;
        default:
            return undefined;
    }
}

export function DefaultSubjectCard({
    className,
    name,
    type = 'user',
    url,
    internal,
    noLink,
    showIcon,
}: SubjectCardProps) {
    const resUrl = internal ? makeUrl(type, name) : url;
    const icon = showIcon ? makeSubjectIcon(type) : undefined;

    return <SubjectName {...{className, name, type, url: noLink ? undefined : resUrl, icon}} />;
}

export function SubjectName({
    name,
    type = 'user',
    url,
    children,
    icon,
    className,
}: {
    className?: string;
    name: SubjectCardProps['name'];
    type?: SubjectCardProps['type'];
    url?: string;
    icon?: React.ReactNode;
    children?: React.ReactElement;
}) {
    return (
        <a
            className={block({type}, className)}
            href={url}
            title={typeof name === 'string' ? name : undefined}
            target="_blank"
            rel="noopener noreferrer"
        >
            {icon ? <span className={block('icon')}>{icon}</span> : null}
            <span className={block('name')}>{name ?? children}</span>
        </a>
    );
}
