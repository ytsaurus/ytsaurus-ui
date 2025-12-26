import {Table, TableProps, useWindowRowVirtualizer} from '@gravity-ui/table';
import {Cell, Header} from '@gravity-ui/table/tanstack';
import {Flex, FlexProps} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {useScrollMargin} from '../../hooks/use-scroll-margin';
import './DataTableGravity.scss';

const block = cn('yt-gravity-table');

export type VirtuallizerProps =
    | {virtualized: never; rowHeight: never}
    | {virtualized: true; rowHeight: number};

export const getCellStyles = <TData, TValue = unknown>(
    cell?: Cell<TData, TValue> | Header<TData, TValue>,
    style?: React.CSSProperties,
): React.CSSProperties | undefined => {
    if (!cell) {
        return style;
    }

    const isPinned = cell.column.getIsPinned();

    return {
        width: cell.column.getSize(),
        minWidth: cell.column.columnDef.minSize,
        maxWidth: cell.column.columnDef.maxSize,
        left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
        ...style,
    };
};

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
    const [element, setElement] = React.useState<HTMLDivElement | null>(null);
    const scrollMargin = useScrollMargin({element});

    const rowVirtualizer = useWindowRowVirtualizer({
        count: props.table.getRowModel().rows.length,
        estimateSize: () => rowHeight,
        overscan: 5,
        scrollMargin,
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

    const {cellAttributes: cellAttrs, headerCellAttributes: headerCellAttrs} = props;

    const cellAttributes = React.useCallback<
        Exclude<typeof props.cellAttributes & Function, undefined>
    >(
        (cell) => {
            const res = typeof cellAttrs === 'function' ? cellAttrs(cell) : cellAttrs;

            const style = {...getCellStyles(cell)};
            if (style.left !== undefined) {
                Object.assign(style, {
                    left: `calc(${style.left} + var(--gn-aside-header-size))`,
                });
            }

            return {
                ...res,
                style: {
                    ...res?.style,
                    ...style,
                },
            };
        },
        [cellAttrs],
    );

    const headerCellAttributes = React.useCallback<
        Exclude<typeof props.headerCellAttributes & Function, undefined>
    >(
        (header) => {
            const res =
                typeof headerCellAttrs === 'function' ? headerCellAttrs(header) : headerCellAttrs;

            const style = {...getCellStyles(header)};
            if (style.left !== undefined) {
                Object.assign(style, {left: `calc(${style.left} + var(--gn-aside-header-size))`});
            }

            return {
                ...res,
                style: {
                    ...res?.style,
                    ...style,
                },
            };
        },
        [headerCellAttrs],
    );

    return (
        <div className={block({virtualized}, className)} ref={setElement}>
            <Table
                className={block('table')}
                stickyHeader
                rowClassName={rowClassNameFn}
                {...virtualizerProps}
                {...props}
                cellAttributes={cellAttributes}
                headerCellAttributes={headerCellAttributes}
            />
        </div>
    );
}

export function TableCell({
    children,
    ...rest
}: {children: React.ReactNode} & Partial<Pick<Omit<FlexProps, 'style'>, 'justifyContent'>>) {
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
