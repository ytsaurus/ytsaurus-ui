import React from 'react';

import qs from 'qs';

import Link, {LinkProps} from '../../../components/Link/Link';

import {Page} from '../../../constants/index';

import encoder from '../../../common/utils/url-encoder';

const YT = (window as any).YT;

interface Props {
    name: string;
    path: string;
    originalPath: string;
    transaction: string;
    remote: boolean;
    url: string;
    isFolder: boolean;
    className?: string;
    theme: LinkProps['theme'];
}

export default function OperationIOLink(props: Props) {
    const {
        name,
        path,
        originalPath,
        transaction,
        remote,
        url: itemUrl,
        isFolder,
        className,
        theme,
    } = props;

    const query = qs.stringify({path, t: transaction}, {encoder});
    const url = remote ? itemUrl : `/${YT.cluster}/${Page.NAVIGATION}?${query}`;
    const originalQuery = qs.stringify({path: originalPath}, {encoder});
    const originalUrl = `/${YT.cluster}/${Page.NAVIGATION}?${originalQuery}`;

    return isFolder ? (
        <Link theme={theme} className={className} url={url} title={path}>
            {path}
        </Link>
    ) : (
        <Link
            theme={theme}
            className={className}
            url={originalPath ? originalUrl : url}
            title={originalPath || path || name}
        >
            {originalPath || path || name}
        </Link>
    );
}
