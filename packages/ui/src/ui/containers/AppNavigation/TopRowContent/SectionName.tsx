import React from 'react';
import cn from 'bem-cn-lite';

import {useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router';
import {getPagesInfoMapById} from '../../../store/selectors/slideoutMenu';

import Link from '../../../components/Link/Link';
import {getCluster} from '../../../store/selectors/global';
import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../../shared/constants/settings';

import './SectionName.scss';
const block = cn('top-row-section');

interface Props {
    page: string;
    name?: string;
    className?: string;
    children?: React.ReactNode;
    urlParams?: object;
    showSplitter?: boolean;
}

const other: Record<string, {name: string}> = {
    [Page.CHAOS_CELL_BUNDLES]: {name: 'Bundles'},
};

export function RowWithName({page, name, className, children, showSplitter, urlParams}: Props) {
    const cluster = useSelector(getCluster);
    const info = useSelector(getPagesInfoMapById)[page] || other[page];
    const title = name || info?.name;
    const url = makeRoutedURL(`/${cluster}/${page}`, urlParams);
    return (
        <div className={block(null, className)}>
            {title && (
                <h1 className={block('name')}>
                    <Link routed theme={'primary'} url={url}>
                        {title}
                    </Link>
                </h1>
            )}
            {showSplitter && <div className={block('spacer')} />}
            {children}
        </div>
    );
}

const RowWithNameMemo = React.memo(RowWithName);

export default function SectionName({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const {
        params: {page},
    } = useRouteMatch<{page: string}>();

    return (
        <RowWithNameMemo className={className} page={page}>
            {children}
        </RowWithNameMemo>
    );
}
