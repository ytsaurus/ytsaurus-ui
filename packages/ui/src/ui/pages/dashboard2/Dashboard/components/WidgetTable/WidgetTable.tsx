import React, {useEffect, useMemo, useRef, useState} from 'react';
import b from 'bem-cn-lite';
import {Table, useTable} from '@gravity-ui/table';

import keyBy_ from 'lodash/keyBy';

import './WidgetTable.scss';

const block = b('widget-table');

interface WidgetTableProps<T> {
    data: T[];
    columns: any[];
    columnsVisibility?: Record<string, boolean>;
    className?: string;
}

export function WidgetTable<T>({data, columns, columnsVisibility}: WidgetTableProps<T>) {
    const [visibleRowsCount, setVisibleRowsCount] = useState<number>(0);

    useEffect(() => {
        setVisibleRowsCount(data.length);
    }, [data.length]);

    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!tableContainerRef.current) return;

        const calculateVisibleRows = () => {
            const container = tableContainerRef.current;
            if (!container) return;

            const containerHeight = container.clientHeight;
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
    }, [visibleRowsCount, tableContainerRef.current?.clientHeight]);

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
        <div
            ref={tableContainerRef}
            style={{
                height: '100%',
                overflow: 'auto',
                position: 'relative',
                width: '100%',
            }}
        >
            <Table table={table} className={block()} verticalAlign={'middle'} />
        </div>
    );
}
