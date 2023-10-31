import React from 'react';
import cn from 'bem-cn-lite';

import YT from '../../config/yt-config';
import UIFactory from '../../UIFactory';

import './UserLink.scss';

const block = cn('user-link');

interface Props {
    className?: string;
    noLink?: boolean;
    internal?: boolean; // use YT link

    userName: string;

    children?: React.ReactElement;
}

export function UserCard({userName, className, noLink, internal, children}: Props) {
    const url = internal
        ? `/${YT.cluster}/users?filter=${userName}`
        : UIFactory.makeUrlForUserName({login: userName, cluster: YT.cluster});

    return <UserName {...{className, userName, url: noLink ? undefined : url, children}} />;
}

export function UserName({
    userName,
    url,
    children,
    className,
}: {
    className?: string;
    userName: string;
    url?: string;
    children?: React.ReactElement;
}) {
    return (
        <a
            key={userName}
            className={block(null, className)}
            href={url}
            title={userName}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className={block('name')}>{children || userName}</span>
        </a>
    );
}
