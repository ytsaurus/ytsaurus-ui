import React from 'react';
import cn from 'bem-cn-lite';

import YT from '../../config/yt-config';
import UIFactory from '../../UIFactory';

import './SubjectLink.scss';

const block = cn('yt-subject-link');

export type SubjectCardProps = {
    className?: string;
    noLink?: boolean;

    internal?: boolean;
    url?: string;

    name: string;
    type?: 'user';
};

export function DefaultSubjectCard({
    name,
    type = 'user',
    className,
    noLink,
    internal,
}: SubjectCardProps) {
    const url = internal
        ? `/${YT.cluster}/users?filter=${name}`
        : UIFactory.makeUrlForUserName({login: name, cluster: YT.cluster});

    return <SubjectName {...{className, name, type, url: noLink ? undefined : url}} />;
}

export function SubjectCard(props: SubjectCardProps) {
    return UIFactory.renderSubjectCard(props);
}

export function SubjectName({
    name,
    type = 'user',
    url,
    children,
    className,
}: {
    className?: string;
    name: string;
    type?: 'user';
    url?: string;
    children?: React.ReactElement;
}) {
    return (
        <a
            key={name}
            className={block({type}, className)}
            href={url}
            title={name}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className={block('name')}>{name ?? children}</span>
        </a>
    );
}
