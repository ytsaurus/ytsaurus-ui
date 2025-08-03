import React from 'react';
import b from 'bem-cn-lite';
import {AxiosError} from 'axios';
import {Table, useTable} from '@gravity-ui/table';
import {ColumnDef} from '@gravity-ui/table/tanstack';

import {YTErrorBlock} from '../../../../../components/Error/Error';

import {YTError} from '../../../../../../@types/types';

import {WidgetSkeleton} from '../WidgetSkeleton/WidgetSkeleton';
import {WidgetNoItemsTextFallback} from '../WidgetFallback/WidgetFallback';

import './WidgetTable.scss';

const block = b('widget-table');
const containerBlock = b('table-widget-container');

interface WidgetTableProps<T> {
    data: T[];
    columns: ColumnDef<T, any>[];
    itemHeight: number;
    isLoading: boolean;
    fallback: {
        itemsName: string;
    };
    columnsVisibility?: Record<string, boolean>;
    className?: string;
    error?: unknown;
}

function TableContainer({children}: {children: React.ReactNode}) {
    return <div className={containerBlock()}>{children}</div>;
}

export function WidgetTable<T>({
    data,
    columns,
    columnsVisibility,
    isLoading,
    itemHeight,
    fallback,
    error,
}: WidgetTableProps<T>) {
    const table = useTable({
        data,
        columns,
        state: {
            columnVisibility: columnsVisibility,
        },
    });

    if (isLoading) {
        return <WidgetSkeleton itemHeight={itemHeight} />;
    }

    if (error) {
        return (
            <TableContainer>
                <YTErrorBlock view={'compact'} error={error as YTError | AxiosError} />
            </TableContainer>
        );
    }

    if (!data?.length) {
        return (
            <TableContainer>
                <WidgetNoItemsTextFallback itemsName={fallback.itemsName} />
            </TableContainer>
        );
    }

    return (
        <TableContainer>
            <Table table={table} className={block()} verticalAlign={'middle'} />
        </TableContainer>
    );
}
