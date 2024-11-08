import React, {FC, MouseEvent} from 'react';

export const BreadcrumbsItem: FC<{
    item: {text: string; href: string};
    isCurrent: boolean;
    onClick: (path: string) => void;
}> = ({item, isCurrent, onClick}) => {
    const handleItemClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (item.href && !isCurrent) {
            onClick(item.href);
        }
    };

    return (
        <div data-qa={item.text} onClick={handleItemClick}>
            {item.text}
        </div>
    );
};
