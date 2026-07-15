import {FolderTree} from '@gravity-ui/icons';
import {Breadcrumbs} from '@gravity-ui/uikit';
import {ClipboardButton} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import React from 'react';
import ypath from '../../common/thor/ypath';
import {YT} from '../../config/yt-config';
import Link from '../../containers/Link/Link';
import {makeNavigationLink} from '../../utils/app-url/navigation';
import './NavigationBreadcrumbs.scss';

const block = cn('yt-navigation-breadcrumbs');

export type NavigationBreadcrumbsItem = {
    path: string;
    href: string;
    text: string;
};

export type OnItemClickType = (
    e: React.MouseEvent,
    options: {item: NavigationBreadcrumbsItem; isLast: boolean},
) => void;

type NavigationBreadcrumbsProps = {
    className?: string;
    path: string;
    cluster?: string;
    onItemClick?: OnItemClickType;
    maxItems?: number;
    hideCopyButton?: boolean;
};

export function NavigationBreadcrumbs({
    className,
    path,
    cluster = YT.cluster,
    onItemClick,
    maxItems,
    hideCopyButton,
}: NavigationBreadcrumbsProps) {
    const items = React.useMemo(() => {
        if (!cluster) return [];

        const yPath = new ypath.YPath(path, 'absolute');

        const result: Array<NavigationBreadcrumbsItem> = [];
        yPath.fragments.forEach((item: {name: string}, index: number) => {
            const subPath = ypath.YPath.clone(yPath).toSubpath(index);
            const subPathStr = subPath.stringify();
            result.push({
                path: subPathStr,
                href: makeNavigationLink({path: subPathStr}),
                text: item.name,
            });
        });

        return result.map((item, index) => {
            const isLast = index === result.length - 1;
            return (
                <Breadcrumbs.Item
                    key={index}
                    href={item.href}
                    onClick={(e) => {
                        onItemClick?.(e, {item, isLast});
                    }}
                >
                    <Link
                        data-qa={item.text}
                        routed
                        url={item.href}
                        theme={isLast ? 'primary' : 'secondary'}
                    >
                        {index === 0 ? <FolderTree className={block('root-icon')} /> : item.text}
                    </Link>
                </Breadcrumbs.Item>
            );
        });
    }, [path, onItemClick, cluster]);

    return (
        <Breadcrumbs
            className={block(null, className)}
            maxItems={maxItems}
            endContent={
                hideCopyButton ? undefined : (
                    <ClipboardButton
                        className={block('copy-btn')}
                        view="flat-secondary"
                        text={path}
                    />
                )
            }
        >
            {items}
        </Breadcrumbs>
    );
}
