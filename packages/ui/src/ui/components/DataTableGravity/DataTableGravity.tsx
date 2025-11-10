import React from 'react';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';
import {Table, TableProps, useRowVirtualizer} from '@gravity-ui/table';

import './DataTableGravity.scss';

const block = cn('yt-gravity-table');

export type VirtuallizerProps =
    | {virtualized: never; rowHeight: never}
    | {virtualized: true; rowHeight: number};

export function DataTableGravity<TData, TScrollElement extends Element | Window>({
    className,
    virtualized,
    rowHeight,
    ...props
}: TableProps<TData, TScrollElement> & {
    style?: React.CSSProperties;
} & VirtuallizerProps) {
    const containerRef = React.useRef<HTMLTableSectionElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: props.table.getRowModel().rows.length,
        estimateSize: () => rowHeight,
        overscan: 5,
        getScrollElement: () => containerRef.current,
    });

    const virtualizerProps = virtualized ? {rowVirtualizer} : ({} as {});

    return (
        <div className={block({virtualized}, className)} ref={containerRef}>
            <Table className={block('table')} stickyHeader {...virtualizerProps} {...props} />
        </div>
    );
}

export function TableCell({children}: {children: React.ReactNode}) {
    return (
        <Flex
            style={{height: '100%', width: '100%', overflow: 'hidden'}}
            alignItems="center"
            wrap="nowrap"
        >
            {children}
        </Flex>
    );
}
