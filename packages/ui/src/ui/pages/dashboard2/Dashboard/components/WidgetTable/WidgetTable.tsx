import React, {useEffect, useMemo, useRef, useState} from 'react';
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

export function WidgetTable<T>({
    data,
    columns,
    columnsVisibility,
    isLoading,
    itemHeight,
    fallback,
    error,
}: WidgetTableProps<T>) {
    const [visibleRowsCount, setVisibleRowsCount] = useState<number>(0);
    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setVisibleRowsCount(data.length);
    }, [data.length]);

    // useEffect(() => {
    //     if (!tableContainerRef.current) return undefined;

    //     const calculateVisibleRows = (entries: ResizeObserverEntry[]) => {
    //         const entry = entries[0];
    //         if (!entry) return;

    //         const container = tableContainerRef.current;
    //         if (!container) return;

    //         const containerHeight = entry.contentRect.height;

    //         const thead = container.querySelector('.gt-table__header');
    //         const headerHeight = thead ? thead.clientHeight : 0;

    //         const rows = container.querySelectorAll('.gt-table__row');
    //         if (rows.length === 0) return;

    //         const rowHeight = rows[0].clientHeight;
    //         if (rowHeight === 0) return;

    //         const availableHeight = containerHeight - headerHeight;
    //         const maxRows = Math.floor(availableHeight / rowHeight);

    //         setVisibleRowsCount(Math.max(1, maxRows));
    //     };

    //     const resizeObserver = new ResizeObserver(calculateVisibleRows);
    //     resizeObserver.observe(tableContainerRef.current);

    //     return () => {
    //         resizeObserver.disconnect();
    //     };
    // }, [visibleRowsCount]);

    const visibleData = useMemo(() => {
        return data.slice(0, visibleRowsCount);
    }, [data, visibleRowsCount]);

    const table = useTable({
        data: visibleData,
        columns,
        state: {
            columnVisibility: columnsVisibility,
        },
    });

    return (
        <div ref={tableContainerRef} className={containerBlock()}>
            {isLoading ? (
                <div style={{maxWidth: '100%'}}>
                    <WidgetSkeleton itemHeight={itemHeight} />
                </div>
            ) : error ? (
                <YTErrorBlock view={'compact'} error={error as YTError | AxiosError} />
            ) : (
                <>
                    {data?.length ? (
                        <Table table={table} className={block()} verticalAlign={'middle'} />
                    ) : (
                        <WidgetNoItemsTextFallback itemsName={fallback.itemsName} />
                    )}
                </>
            )}
        </div>
    );
}
