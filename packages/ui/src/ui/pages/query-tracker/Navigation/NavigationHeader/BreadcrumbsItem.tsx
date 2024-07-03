import React, {FC, MouseEvent} from 'react';
import {BreadcrumbsItem as BreadcrumbsItemType} from '@gravity-ui/uikit/build/esm/components/Breadcrumbs/Breadcrumbs';

export const BreadcrumbsItem: FC<{
    item: BreadcrumbsItemType;
    isCurrent: boolean;
    onClick: (path: string) => void;
}> = ({item, isCurrent, onClick}) => {
    const handleItemClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (item.href && !isCurrent) {
            onClick(item.href);
        }
    };

    return <div onClick={handleItemClick}>{item.text}</div>;
};
