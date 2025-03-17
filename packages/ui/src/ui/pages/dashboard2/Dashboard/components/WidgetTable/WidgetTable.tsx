import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {Table, useTable} from '@gravity-ui/table';
import {getCoreRowModel} from '@gravity-ui/table/tanstack';

import './WidgetTable.scss';

interface WidgetTableProps<T> {
    data: T[];
    columns: any[];
    className?: string;
}

export const WidgetTable = memo(function WidgetTable<T>({data, columns}: WidgetTableProps<T>) {
    const [visibleRowsCount, setVisibleRowsCount] = useState<number>(data.length);

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
        getCoreRowModel: getCoreRowModel(),
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
            <Table table={table} />
        </div>
    );
});

//export function withTable<I>(Table: ComponentType<TableProps<I>>) {
//     return memo(function WithTable(props: UseTableOptions<I> & TableProps<I>) {
//         const containerRef = useRef(null);
//         const [visibleRows, setVisibleRows] = useState(props.data.length);

//         const table = useTable({data: props.data, columns: props.columns});

//         table.getRowModel()

//         useEffect(() => {
//             if (!containerRef.current) return;
//             const calculateVisibleRows = () => {
//                 const container = containerRef.current;
//                 const table = container.querySelector('table');

//                 if (!table) return;
//                 const containerHeight = container.clientHeight;

//                 const headerHeight = table.querySelector('thead')?.clientHeight || 0;

//                 const availableHeight = containerHeight - headerHeight;

//                 const row = table.querySelector('tbody .gt-table__row');
//                 if (!row) return;

//                 const rowHeight = row.clientHeight;
//                 let totalHeight = 0;
//                 let rowCount = 0;

//                 for (let i = 0; i < props.data.length; i++) {
//                     if (totalHeight + rowHeight > availableHeight + 10) break;

//                     totalHeight += rowHeight;
//                     rowCount++;
//                 }

//                 setVisibleRows(Math.max(1, rowCount));
//             };

//             calculateVisibleRows();

//             const resizeObserver = new ResizeObserver(calculateVisibleRows);
//             resizeObserver.observe(containerRef.current);

//             return () => resizeObserver.disconnect();
//         }, [props.data.length, visibleRows]);

//         console.log(visibleRows);
//         return (
//             <div ref={containerRef} style={{overflow: 'hidden', width: '100%'}}>
//                 <Table table={table}></Table>
//             </div>
//         );
//     });
// }
