import React, {FC, useCallback, useMemo} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {BreadcrumbsItem as BreadcrumbsItemComponent} from './BreadcrumbsItem';
import {Breadcrumbs, BreadcrumbsItem} from '../../../../components/Breadcrumbs';

type Props = {
    path: string;
    cluster: string | undefined;
    onClusterChangeClick: () => void;
    onItemClick: (path: string) => void;
};

export const NavigationBreadcrumbs: FC<Props> = ({
    path,
    cluster,
    onClusterChangeClick,
    onItemClick,
}) => {
    const handleBreadcrumbsClick = useCallback(
        (newPath: string) => {
            onItemClick(newPath);
        },
        [onItemClick],
    );

    const items = useMemo(() => {
        if (!cluster) return [];

        let href = '/';
        const result = [{text: cluster, href: '/'}];
        path.split('/').forEach((text) => {
            if (text) {
                href += '/' + text;
                result.push({
                    text,
                    href,
                });
            }
        });

        return result.map((item, index) => {
            const isCurrent = index === result.length - 1;
            return (
                <BreadcrumbsItem key={item.text}>
                    <BreadcrumbsItemComponent
                        item={item}
                        isCurrent={isCurrent}
                        onClick={handleBreadcrumbsClick}
                    />
                </BreadcrumbsItem>
            );
        });
    }, [cluster, path, handleBreadcrumbsClick]);

    return (
        <>
            <Button size="s" view="flat" onClick={onClusterChangeClick}>
                <Icon data={FolderTreeIcon} size={16} />
            </Button>
            <Breadcrumbs showRoot>{items}</Breadcrumbs>
        </>
    );
};
