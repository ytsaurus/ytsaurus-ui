import React from 'react';
import {Table, TableDataItem, TableProps, withTableSorting} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './TableWithSorting.scss';

const TableSorting = withTableSorting(Table);
const b = cn('table-with-sorting');

export const TableWithSorting = (props: TableProps<TableDataItem>) => {
    return <TableSorting {...props} className={b(null, props.className)} />;
};
