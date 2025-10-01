import React from 'react';
import cn from 'bem-cn-lite';

import {Table, TableProps} from '@gravity-ui/table';

import './DataTableGravity.scss';

const block = cn('yt-gravity-table');

export function DataTableGravity<TData, TScrollElement extends Element | Window>({
    className,
    ...props
}: TableProps<TData, TScrollElement>) {
    return <Table className={block(null, className)} {...props} />;
}
