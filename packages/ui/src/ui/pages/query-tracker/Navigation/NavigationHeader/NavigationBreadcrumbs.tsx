import React, {FC, useCallback, useMemo} from 'react';
import {
    Breadcrumbs,
    BreadcrumbsItem as BreadcrumbsItemType,
    Button,
    FirstDisplayedItemsCount,
    Icon,
    LastDisplayedItemsCount,
} from '@gravity-ui/uikit';
import FolderTreeIcon from '@gravity-ui/icons/svgs/folder-tree.svg';
import {BreadcrumbsItem} from './BreadcrumbsItem';

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
        let href = '/';
        if (!cluster) return [];

        const result = [
            {
                text: cluster,
                action: () => {
                    onItemClick('/');
                },
            },
        ];
        const pathItems = path.split('/').reduce<BreadcrumbsItemType[]>((acc, text) => {
            if (text) {
                href += '/' + text;
                acc.push({
                    text,
                    href,
                    action: () => {},
                });
            }

            return acc;
        }, []);

        return [...result, ...pathItems];
    }, [cluster, path, onItemClick]);

    return (
        <>
            <Button size="s" view="flat" onClick={onClusterChangeClick}>
                <Icon data={FolderTreeIcon} size={16} />
            </Button>
            <Breadcrumbs
                items={items}
                renderItemContent={(item, isCurrent) => (
                    <BreadcrumbsItem
                        item={item}
                        isCurrent={isCurrent}
                        onClick={handleBreadcrumbsClick}
                    />
                )}
                firstDisplayedItemsCount={FirstDisplayedItemsCount[path ? 'Zero' : 'One']}
                lastDisplayedItemsCount={LastDisplayedItemsCount.One}
            />
        </>
    );
};
