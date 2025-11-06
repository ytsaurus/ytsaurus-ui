import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, FlexProps} from '@gravity-ui/uikit';
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
    scrollToIndex,
    rowClassName,
    isHighlightedRow,
    ...props
}: TableProps<TData, TScrollElement> & {
    style?: React.CSSProperties;
    scrollToIndex?: number;
    isHighlightedRow?: (row?: TData) => boolean;
} & VirtuallizerProps) {
    const containerRef = React.useRef<HTMLTableSectionElement>(null);

    const rowVirtualizer = useRowVirtualizer({
        count: props.table.getRowModel().rows.length,
        estimateSize: () => rowHeight,
        overscan: 5,
        getScrollElement: () => containerRef.current,
    });

    const virtualizerProps = virtualized ? {rowVirtualizer} : ({} as {});

    React.useEffect(() => {
        let timerId: ReturnType<typeof setTimeout>;
        if (scrollToIndex !== undefined && scrollToIndex >= 0) {
            timerId = setTimeout(
                () => rowVirtualizer.scrollToIndex(scrollToIndex, {align: 'center'}),
                500,
            );
        }
        return () => clearTimeout(timerId);
    }, [rowVirtualizer, scrollToIndex]);

    const rowClassNameFn = React.useCallback<Exclude<typeof rowClassName, undefined | string>>(
        (row) => {
            const highlighted = isHighlightedRow ? isHighlightedRow(row?.original) : undefined;
            return block(
                'row',
                {highlighted},
                typeof rowClassName === 'string' ? rowClassName : rowClassName?.(row),
            );
        },
        [rowClassName, isHighlightedRow],
    );

    return (
        <div className={block({virtualized}, className)} ref={containerRef}>
            <Table
                className={block('table')}
                stickyHeader
                rowClassName={rowClassNameFn}
                {...virtualizerProps}
                {...props}
            />
        </div>
    );
}

export function TableCell({
    children,
    ...rest
}: {children: React.ReactNode} & Pick<Omit<FlexProps, 'style'>, 'justifyContent'>) {
    return (
        <Flex
            {...rest}
            style={{height: '100%', width: '100%', overflow: 'hidden'}}
            alignItems="center"
            wrap="nowrap"
        >
            {children}
        </Flex>
    );
}
