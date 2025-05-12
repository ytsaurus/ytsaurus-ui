import React, {useEffect, useMemo, useRef, useState} from 'react';
import b from 'bem-cn-lite';
import {Table, useTable} from '@gravity-ui/table';
import {ColumnDef} from '@gravity-ui/table/tanstack';

import {WidgetSkeleton} from '../WidgetSkeleton/WidgetSkeleton';
import {WidgetFallback} from '../WidgetFallback/WidgetFallback';

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

    useEffect(() => {
        if (!tableContainerRef.current) return undefined;

        const calculateVisibleRows = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;

            const container = tableContainerRef.current;
            if (!container) return;

            const containerHeight = entry.contentRect.height;

            const thead = container.querySelector('.gt-table__header');
            const headerHeight = thead ? thead.clientHeight : 0;

            const rows = container.querySelectorAll('.gt-table__row');
            if (rows.length === 0) return;

            const rowHeight = rows[0].clientHeight;
            if (rowHeight === 0) return;

            const availableHeight = containerHeight - headerHeight;
            const maxRows = Math.floor(availableHeight / rowHeight);

            setVisibleRowsCount(Math.max(1, maxRows));
        };

        const resizeObserver = new ResizeObserver(calculateVisibleRows);
        resizeObserver.observe(tableContainerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [data, visibleRowsCount]);

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
                <WidgetSkeleton itemHeight={itemHeight} />
            ) : (
                <>
                    {data?.length ? (
                        <Table table={table} className={block()} verticalAlign={'middle'} />
                    ) : (
                        <WidgetFallback itemsName={fallback?.itemsName} error={error} />
                    )}
                </>
            )}
        </div>
    );
}
