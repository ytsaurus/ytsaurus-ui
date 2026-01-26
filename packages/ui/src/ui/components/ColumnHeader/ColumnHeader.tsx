import React from 'react';
import cn from 'bem-cn-lite';

import barsDescendingSvg from '@gravity-ui/icons/svgs/bars-descending-align-left.svg';
import {Button, DropdownMenu, Icon, Text} from '@gravity-ui/uikit';

import format from '../../common/hammer/format';

import SortIcon from '../../components/SortIcon/SortIcon';

import {OrderType, calculateNextOrderValue, nextSortOrderValue} from '../../utils/sort-helpers';
import PageCounter, {PageCounterProps} from '../../components/PageCounter/PageCounter';
import Loader from '../../components/Loader/Loader';
import {rumLogError} from '../../rum/rum-counter';

import './ColumnHeader.scss';

const block = cn('column-header');

export type ColumnInfo<T> = {
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
    allowedOrderTypes?: Array<OrderType>;
};

export type HasSortColumn<T> =
    | (ColumnInfo<T> & {options?: undefined})
    | ({
          title: string;
          shortTitle?: string;
          column: T;
          options: Array<ColumnInfo<T>>;
      } & Partial<Record<keyof Omit<ColumnInfo<T>, 'column' | 'title' | 'shortTitle'>, undefined>>);

export type ColumnHeaderProps<T extends string = string> = PageCounterProps &
    HasSortColumn<T> & {
        className?: string;
        order?: OrderType;
        multisortIndex?: number;
        sortIconSize?: number;
        onSort?: (
            column: T,
            nextOrder: OrderType,
            options: {currentOrder?: OrderType; multisort?: boolean},
        ) => void;

        loading?: boolean;

        align?: 'center' | 'left' | 'right';
    };

type NameTitleContent = {
    nameContent: string;
    titleContent: string;
};

function getNameTitle<T extends string>({
    column,
    title,
    shortTitle,
}: Pick<ColumnInfo<T>, 'column' | 'title' | 'shortTitle'>): NameTitleContent {
    const t = title ?? format.ReadableField(column);
    const nameContent = !shortTitle ? t : shortTitle;
    return {nameContent, titleContent: t};
}

function useColumnInfo<T extends string = string>(
    props: ColumnHeaderProps<T>,
): ColumnInfo<T> & NameTitleContent & {subColumn?: NameTitleContent} {
    if (props.options === undefined) {
        const {column, allowUnordered, withUndefined, title, shortTitle, allowedOrderTypes} = props;
        return {
            column,
            allowUnordered,
            withUndefined,
            allowedOrderTypes,
            ...getNameTitle({column, title, shortTitle}),
        };
    }

    const {column: value, options, title, shortTitle} = props;
    const columnData = options.find(({column}) => value === column)!;
    if (!columnData) {
        rumLogError({
            message: 'Unexpected behavior: missing value in ColumnHeader.props.options',
            additional: props,
        });
    }
    return {
        subColumn: getNameTitle({...columnData}),
        ...columnData,
        ...getNameTitle({column: '', title, shortTitle}),
    };
}

export default function ColumnHeader<T extends string = string>(props: ColumnHeaderProps<T>) {
    const {
        className,
        align,
        order,
        onSort,
        multisortIndex,
        loading,
        pageIndex,
        pageCount,
        sortIconSize,
    } = props;
    const {
        column,
        allowUnordered,
        withUndefined,
        nameContent,
        titleContent,
        allowedOrderTypes,
        subColumn,
    } = useColumnInfo(props);

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
        [column, order, onSort, allowUnordered, allowedOrderTypes, withUndefined],
    );

    const sortable = Boolean(onSort);

    return (
        <div className={block(null, className)}>
            <div
                className={block('label-icon', {sortable, align})}
                onClick={sortable ? changeHandler : undefined}
            >
                <span className={block('label')} title={titleContent}>
                    {nameContent}
                </span>
                {sortable && (
                    <span className={block('icon')}>
                        <SortIcon order={order} size={sortIconSize} />
                    </span>
                )}
                {multisortIndex !== undefined && (
                    <span className={block('multisort')}>
                        &nbsp;<sup>{multisortIndex}</sup>
                    </span>
                )}
                {Boolean(order) && Boolean(subColumn) && (
                    <Text
                        className={block('label', {'sub-column': true})}
                        variant="caption-2"
                        title={subColumn?.titleContent}
                        color="dark-secondary"
                    >
                        {subColumn?.nameContent}
                    </Text>
                )}
            </div>
            <SubColumnSelector options={props.options} order={order} onSort={onSort} />
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

function SubColumnSelector<T extends string>({
    order,
    options,
    onSort,
}: Pick<ColumnHeaderProps<T>, 'onSort'> & {
    order?: ColumnHeaderProps<T>['order'];
    options?: Array<ColumnInfo<T>>;
}) {
    return !options ? null : (
        <DropdownMenu
            items={options.map((x) => {
                const {titleContent} = getNameTitle(x);
                return {
                    text: titleContent,
                    action() {
                        if (!onSort) {
                            return;
                        }
                        const {column, allowUnordered, withUndefined, allowedOrderTypes} = x;
                        const nextOrder = allowedOrderTypes
                            ? calculateNextOrderValue(order, allowedOrderTypes)
                            : nextSortOrderValue(order, allowUnordered, withUndefined);
                        onSort(column, nextOrder, {
                            currentOrder: order,
                        });
                    },
                };
            })}
            renderSwitcher={({onClick}) => (
                <Button onClick={onClick} view="flat" size="xs">
                    <Icon size={12} data={barsDescendingSvg} />
                </Button>
            )}
        />
    );
}
