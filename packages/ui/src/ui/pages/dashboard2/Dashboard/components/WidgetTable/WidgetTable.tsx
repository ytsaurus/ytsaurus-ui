import React, {useEffect, useRef, useState} from 'react';
import b from 'bem-cn-lite';
import {Table, useTable} from '@gravity-ui/table';
import {flexRender, getCoreRowModel} from '@gravity-ui/table/tanstack';

import './WidgetTable.scss';

const block = b('styled-table');

interface WidgetTableProps<T> {
    data: T[];
    columns: any[];
    className?: string;
}

export function WidgetTable<T>({data, columns}: WidgetTableProps<T>) {
    const [visibleRowIds, setVisibleRowIds] = useState<Set<string>>(new Set());

    const tableContainerRef = useRef<HTMLDivElement | null>(null);

    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    const table = useTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableHiding: true,
        onColumnVisibilityChange: (updater) => console.log('asdsad'),
    });
    const rows = table.getRowModel().rows;

    useEffect(() => {
        if (!tableContainerRef.current) return;

        const options = {
            root: tableContainerRef.current,
            rootMargin: '0px',
            threshold: 1.0,
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            const newVisibleRows = new Set<string>();

            entries.forEach((entry) => {
                const element = entry.target as HTMLElement;
                const rowId = element.dataset.rowId;
                if (!rowId) return;

                if (entry.isIntersecting && entry.intersectionRatio === 1) {
                    newVisibleRows.add(rowId);
                } else {
                    newVisibleRows.delete(rowId);
                }
            });

            setVisibleRowIds(newVisibleRows);
        };

        const observer = new IntersectionObserver(handleIntersection, options);

        Object.entries(rowRefs.current).forEach(([_, element]) => {
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [rows.length, visibleRowIds]);

    return (
        //<Table table={table} />
        <div
            ref={tableContainerRef}
            style={{
                height: '100%',
                overflow: 'auto',
                position: 'relative',
            }}
        >
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {rows.map((row) => {
                        return (
                            <tr
                                key={row.id}
                                ref={(el) => {
                                    rowRefs.current[row.id] = el;
                                }}
                                data-row-id={row.id}
                                style={{
                                    visibility: visibleRowIds.has(row.id) ? 'visible' : 'hidden',
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

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

