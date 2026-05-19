import React, {type FC, type MouseEventHandler, type ReactNode, useCallback} from 'react';
import block from 'bem-cn-lite';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {type QueryItem} from '../../../../types/query-tracker/api';
import {useQueryItemUrl} from '../../hooks/Query/useQueryItemUrl';
import './QueryItemLink.scss';

const b = block('yt-query-item-link');

type Props = {
    item: QueryItem;
    className?: string;
    children: ReactNode;
};

export const QueryItemLink: FC<Props> = ({item, className, children}) => {
    const href = useQueryItemUrl(item);

    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((event) => {
        event.stopPropagation();
    }, []);

    return (
        <RoutedLink href={href} className={b(null, className)} onClick={handleClick}>
            {children}
        </RoutedLink>
    );
};
