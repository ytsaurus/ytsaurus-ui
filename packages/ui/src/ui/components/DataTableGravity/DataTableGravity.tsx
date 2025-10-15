import React from 'react';
import cn from 'bem-cn-lite';

import {Flex} from '@gravity-ui/uikit';
import {Table, TableProps, useRowVirtualizer} from '@gravity-ui/table';

import {useMemoizedIfEqual} from '../../hooks/use-memoized';

import './DataTableGravity.scss';

const block = cn('yt-gravity-table');

export type VirtuallizerProps =
    | {virtualized: never; rowHeight: never}
    | {virtualized: true; rowHeight: number};

export function DataTableGravity<TData, TScrollElement extends Element | Window>({
    className,
    virtualized,
    rowHeight,
    aboveContentHeight = 0,
    style,
    ...props
}: TableProps<TData, TScrollElement> & {
    style?: React.CSSProperties;
    aboveContentHeight?: number;
} & VirtuallizerProps) {
    const containerRef = React.useRef<HTMLTableSectionElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: props.table.getRowModel().rows.length,
        estimateSize: () => rowHeight,
        overscan: 5,
        getScrollElement: () => containerRef.current,
    });

    const virtualizerProps = virtualized ? {rowVirtualizer} : ({} as {});

    const [memoizedStyle] = useMemoizedIfEqual([style]);

    const effectiveStyle = React.useMemo(() => {
        return {
            '--yt-data-table-graivity-above-content-height': `${aboveContentHeight}px`,
            ...style,
        };
    }, [memoizedStyle, aboveContentHeight]);

    return (
        <div className={block({virtualized}, className)} style={effectiveStyle} ref={containerRef}>
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
