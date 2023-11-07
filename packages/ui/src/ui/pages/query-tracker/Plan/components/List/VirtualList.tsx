import * as React from 'react';

import Loader from '../Loader/Loader';
import {useVirtual} from 'react-virtual';

import {handleRefs, hasKey} from '../../utils';

import {findNextIndex} from './helpers';

import cn from 'bem-cn-lite';
const block = cn('yq-virtual-list');

import './VirtualList.scss';

export interface ListInstance {
    resetSizes(): void;
}

const OVERSCAN_COUNT = 3;

function defaultRenderItem<T extends unknown>(item: T) {
    return String(item);
}

export interface VirtualListProps<T> {
    listRef?: React.Ref<ListInstance>;
    className?: string;
    containerRef?: React.Ref<HTMLDivElement>;
    scrollRef?: React.Ref<HTMLDivElement>;
    wrapperClassName?: string;

    items: T[];
    itemHeight?: number | ((item: T, index: number) => number);
    renderItem?: (
        item: T,
        itemIndex: number,
        opts: {active?: boolean; selected?: boolean},
    ) => React.ReactNode;
    itemWrapper?: string | React.ComponentType<any>;
    itemClassName?: string | ((item: T, index: number) => string);
    itemKey?: (item: T, index: number) => number | string;
    activeItemIndex?: number;
    selectedItemKey?: React.Key;
    onItemClick?: (item: T, index: number, e?: React.MouseEvent, fromKeyboard?: boolean) => void;

    onWrapperScroll?: VoidFunction;

    canFetchMore?: boolean;
    isFetchingMore?: boolean;
    fetchMore?: () => void;

    alwaysShowActiveItem?: boolean;

    headerClassName?: string;
    renderHeader?: () => React.ReactNode;
    headerHeight?: number;
    loaderHeight?: number;
}
export function VirtualList<T>({
    listRef,
    className,
    containerRef,
    scrollRef,
    wrapperClassName,

    items,
    itemHeight = 40,
    renderItem,
    itemWrapper,
    itemClassName,
    itemKey,
    activeItemIndex,
    selectedItemKey,
    onItemClick,

    onWrapperScroll,

    canFetchMore,
    isFetchingMore,
    fetchMore,
    loaderHeight = 40,

    alwaysShowActiveItem,

    headerClassName,
    // headerHeight = 40,
    renderHeader,
}: VirtualListProps<T>) {
    const [activeItem, setActiveItem] = React.useState<number | undefined>();
    const blurTimer = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (alwaysShowActiveItem && (!activeItem || activeItem > items.length - 1)) {
            setActiveItem(0);
        }
    }, [items, activeItem, alwaysShowActiveItem]);

    const _containerRef = React.useRef<HTMLDivElement>(null);
    const parentRef = React.useRef<HTMLDivElement>(null);
    const rowVirtualizer = useVirtual({
        size: canFetchMore ? items.length + 1 : items.length,
        estimateSize: React.useCallback(
            (index: number) => {
                if (index >= items.length) {
                    return loaderHeight;
                }
                if (typeof itemHeight === 'function') {
                    return itemHeight(items[index], index);
                }
                return itemHeight;
            },
            [
                itemHeight,
                loaderHeight,
                items.length,
                typeof itemHeight === 'function' ? items : undefined,
            ],
        ),
        keyExtractor: (index) => {
            if (index === items.length) {
                return 'loader';
            }
            return typeof itemKey === 'function' ? itemKey(items[index], index) : index;
        },
        overscan: OVERSCAN_COUNT,
        parentRef,
    });

    React.useImperativeHandle(
        listRef,
        () => ({
            resetSizes() {
                rowVirtualizer.measure();
            },
        }),
        [rowVirtualizer.measure],
    );

    React.useEffect(() => {
        const [lastItem] = rowVirtualizer.virtualItems.slice(-1);

        if (!lastItem) {
            return;
        }

        if (lastItem.index === items.length && canFetchMore && !isFetchingMore) {
            fetchMore?.();
        }
    }, [canFetchMore, fetchMore, items.length, isFetchingMore, rowVirtualizer.virtualItems]);

    const onFocus = () => {
        if (blurTimer.current) {
            clearTimeout(blurTimer.current);
            blurTimer.current = null;
        }
    };

    const onBlur = () => {
        if (!alwaysShowActiveItem && !blurTimer.current) {
            blurTimer.current = window.setTimeout(() => {
                setActiveItem(undefined);
                blurTimer.current = null;
            }, 50);
        }
    };

    const handleKeyMove = (event: React.KeyboardEvent, step: number, defaultItemIndex = 0) => {
        event.preventDefault();
        setActiveItem((active) => {
            const nextActive = findNextIndex(
                items,
                active,
                (active ?? defaultItemIndex) + step,
                Math.sign(step),
            );
            if (nextActive !== undefined) {
                rowVirtualizer.scrollToIndex(nextActive);
                if (
                    _containerRef.current &&
                    _containerRef.current.contains(event.target as HTMLElement) &&
                    _containerRef.current !== event.target
                ) {
                    _containerRef.current.focus();
                }
            }
            return nextActive;
        });
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (rowVirtualizer.virtualItems.length === 0) {
            return;
        }
        const pageSize = Math.max(1, rowVirtualizer.virtualItems.length - 2 * OVERSCAN_COUNT);
        const visibleStartIndex = rowVirtualizer.virtualItems[0].index;
        switch (event.key) {
            case 'ArrowDown': {
                handleKeyMove(event, 1, visibleStartIndex - 1);
                break;
            }
            case 'ArrowUp': {
                handleKeyMove(event, -1, visibleStartIndex);
                break;
            }
            case 'PageDown': {
                handleKeyMove(event, pageSize, visibleStartIndex);
                break;
            }
            case 'PageUp': {
                handleKeyMove(event, -pageSize, visibleStartIndex);
                break;
            }
            case 'Home': {
                handleKeyMove(event, -(activeItem || 0));
                break;
            }
            case 'End': {
                handleKeyMove(event, items.length - (activeItem || 0) - 1);
                break;
            }
            case 'Enter': {
                if (
                    typeof activeItem === 'number' &&
                    onItemClick &&
                    event.target === event.currentTarget &&
                    items[activeItem] !== undefined
                ) {
                    event.preventDefault();
                    onItemClick(items[activeItem], activeItem, undefined, true);
                }
                break;
            }
        }
    };

    return (
        <div
            ref={handleRefs(_containerRef, containerRef)}
            tabIndex={0}
            className={block(null, className)}
            onFocus={onFocus}
            onBlur={onBlur}
            onMouseLeave={onBlur}
            onKeyDown={handleKeyDown}
        >
            <div className={block('header', headerClassName)}>
                {typeof renderHeader === 'function' ? renderHeader() : null}
            </div>

            <div
                className={block('list', wrapperClassName)}
                ref={handleRefs(parentRef, scrollRef)}
                onScroll={onWrapperScroll}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.totalSize}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.virtualItems.map((virtualRow) => {
                        const isLoaderRow = virtualRow.index > items.length - 1;
                        if (isLoaderRow) {
                            return (
                                <div
                                    key="loader"
                                    ref={virtualRow.measureRef}
                                    className={block('item', {loader: true})}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${loaderHeight}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <Loader local size="s" />
                                </div>
                            );
                        }
                        const item = items[virtualRow.index];
                        const height =
                            typeof itemHeight === 'function'
                                ? itemHeight(item, virtualRow.index)
                                : itemHeight;
                        let disabled = false;
                        if (item && typeof item === 'object' && hasKey(item, 'disabled')) {
                            disabled = Boolean(item.disabled);
                        }
                        const active =
                            activeItem === virtualRow.index || activeItemIndex === virtualRow.index;
                        const selected = selectedItemKey === virtualRow.key;
                        return React.createElement(
                            itemWrapper ?? 'div',
                            {
                                key: virtualRow.key,
                                ref: virtualRow.measureRef,
                                className: block(
                                    'item',
                                    {
                                        active,
                                        selected,
                                        clickable: typeof onItemClick === 'function' && !disabled,
                                    },
                                    typeof itemClassName === 'function'
                                        ? itemClassName(item, virtualRow.index)
                                        : itemClassName,
                                ),
                                style: {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${height}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                },
                                onMouseMove: disabled
                                    ? undefined
                                    : () => {
                                          setActiveItem(virtualRow.index);
                                      },
                                onClick: disabled
                                    ? undefined
                                    : (event: React.MouseEvent) => {
                                          onItemClick?.(item, virtualRow.index, event);
                                      },
                            },
                            typeof renderItem === 'function'
                                ? renderItem(item, virtualRow.index, {active, selected})
                                : defaultRenderItem(item),
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
