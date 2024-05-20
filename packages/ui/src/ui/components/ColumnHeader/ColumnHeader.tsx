import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import SortIcon from '../../components/SortIcon/SortIcon';

import {OrderType, calculateNextOrderValue, nextSortOrderValue} from '../../utils/sort-helpers';
import PageCounter, {PageCounterProps} from '../../components/PageCounter/PageCounter';
import Loader from '../../components/Loader/Loader';

import './ColumnHeader.scss';

const block = cn('column-header');

export interface ColumnHeaderProps<T extends string = string> extends PageCounterProps {
    className?: string;
    sortable?: boolean;
    order?: OrderType;
    allowedOrderTypes?: Array<OrderType>;
    multisortIndex?: number;
    onSort?: (
        column: T,
        nextOrder: OrderType,
        options: {currentOrder?: OrderType; multisort?: boolean},
    ) => void;
    column: T;
    title?: string;
    shortTitle?: string;
    /**
     * Ignored when allowedOrderTypes is defined
     */
    allowUnordered?: boolean;
    /**
     * Ignored when allowedOrderTypes is defined
     */
    withUndefined?: boolean;

    loading?: boolean;
}

export default function ColumnHeader<T extends string = string>(props: ColumnHeaderProps<T>) {
    const {
        className,
        column,
        title,
        shortTitle,
        order,
        onSort,
        allowUnordered,
        withUndefined,
        multisortIndex,
        allowedOrderTypes,
        loading,
        pageIndex,
        pageCount,
    } = props;
    const changeHandler = React.useCallback(
        (e: React.MouseEvent) => {
            const nextOrder = allowedOrderTypes
                ? calculateNextOrderValue(order, allowedOrderTypes)
                : nextSortOrderValue(order, allowUnordered, withUndefined);
            onSort?.(column, nextOrder, {
                currentOrder: order,
                multisort: e.ctrlKey || e.metaKey,
            });
        },
        [column, order, onSort, allowUnordered],
    );

    const titleContent = !shortTitle ? title ?? _.capitalize(column) : shortTitle;
    const sortable = Boolean(onSort);

    return (
        <div
            className={block({sortable}, className)}
            onClick={sortable ? changeHandler : undefined}
        >
            <span className={block('label')} title={title ?? _.capitalize(column)}>
                {titleContent}
            </span>
            <span className={block('icon')}>
                <SortIcon hidden={!sortable} order={order} />
            </span>
            {multisortIndex !== undefined && (
                <span className={block('multisort')}>
                    &nbsp;<sup>{multisortIndex}</sup>
                </span>
            )}
            {loading !== undefined && (
                <div className={block('loader')}>
                    <Loader visible={loading} />
                </div>
            )}
            {Boolean(pageCount) && (
                <PageCounter
                    className={block('page-counter')}
                    pageIndex={pageIndex}
                    pageCount={pageCount}
                />
            )}
        </div>
    );
}
