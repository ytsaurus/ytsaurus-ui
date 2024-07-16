import React from 'react';

import Link, {LinkProps} from '../../../components/Link/Link';

import {Page} from '../../../constants/index';

import {paramsToQuery} from '../../../utils';

const YT = (window as any).YT;

interface Props {
    name: string;
    cluster?: string;
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
        cluster,
        path,
        originalPath,
        transaction,
        remote,
        url: itemUrl,
        isFolder,
        className,
        theme,
    } = props;

    const pathCluster = cluster ?? YT.cluster;

    const query = paramsToQuery({path, t: transaction});
    const url = remote ? itemUrl : `/${pathCluster}/${Page.NAVIGATION}?${query}`;
    const originalQuery = paramsToQuery({path: originalPath});
    const originalUrl = `/${pathCluster}/${Page.NAVIGATION}?${originalQuery}`;

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
