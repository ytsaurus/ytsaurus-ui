// TODO: revisit types
import * as React from 'react';

import {Eye} from '@gravity-ui/icons';
import {Button, ClipboardButton, Text, Icon as UIKitIcon} from '@gravity-ui/uikit';
import hammer from '../../../../common/hammer';
import cn from 'bem-cn-lite';
import DataTable, {Column, OrderType, Settings, SortOrder} from '@gravity-ui/react-data-table';
import DataTypePopup from '../DataTypePopup/DataTypePopup';
import {StrictReactNode, hasKey} from './utils';
import {MOVING} from '@gravity-ui/react-data-table/build/esm/lib/constants';
import DataTableYT from '../../../../components/DataTableYT/DataTableYT';
import {ClickableText} from '../../../../components/ClickableText/ClickableText';
import Label from '../../../../components/Label/Label';

import './YQLTable.scss';

const block = cn('yql-result-table');

const INDEX_COLUMN = Symbol('__index__');
const NUMBER_OF_STRIPPED_LINES = 5;
const MAX_NUMBER_OF_LINE_IS_DISPLAYED_IMMEDIATELY = NUMBER_OF_STRIPPED_LINES + 3;

type Node = {
    $type: string;
    $value: any;
    $sortValue?: number | string;
};

function rowKey(row: unknown, index: number) {
    if (hasKey(row, INDEX_COLUMN)) {
        return row[INDEX_COLUMN] as number;
    }
    return index;
}

function triggerWindowResize() {
    window.dispatchEvent(new Event('resize'));
}

const tableSettings: Settings = {
    sortable: false,
    displayIndices: true,
    stripedRows: true,
    externalSort: true,
    stickyHead: MOVING,
    stickyTop: 0,
    syncHeadOnResize: true,
};

const transposeTableSettings: Settings = {
    ...tableSettings,
    displayIndices: false,
};

export type ShowPreviewCallback = (
    colName: string,
    rowIndex: number,
    tag: string | undefined,
) => void;

type Props = {
    className?: string;
    resultType?: string;
    header?: any[];
    rows?: any[];
    totals?: any[];
    showColumns?: string[];
    format: (...args: any[]) => any;
    formatterSettings?: any;
    theme?: string;
    defaultNumberAlign?: 'right' | 'left' | 'center';
    emptyDataMessage?: string;
    message?: string;
    isError?: boolean;
    transpose?: boolean;
    page?: number;
    pageSize?: number;
    startIndex?: number;
    sortOrder?: SortOrder | SortOrder[];
    onSort?: (sortOrder?: SortOrder | SortOrder[]) => void;
    showFullValueInDialog?: boolean;
    containerRef?: React.Ref<HTMLDivElement>;
    onShowPreview: ShowPreviewCallback;
};

const emptyArray: any[] = [];
export default function Table({
    className,
    header = emptyArray,
    rows = emptyArray,
    totals = emptyArray,
    showColumns = emptyArray,
    theme = 'yandex-cloud',
    format,
    formatterSettings,
    defaultNumberAlign = DataTable.RIGHT,
    resultType,
    emptyDataMessage,
    message,
    isError,
    transpose = false,
    page = 1,
    pageSize = rows.length,
    startIndex,
    sortOrder,
    onSort,
    showFullValueInDialog,
    containerRef,
    onShowPreview,
}: Props) {
    const sortable = typeof onSort === 'function';
    const columns = React.useMemo(() => {
        const columns = header.map((column): Column<WithIndex<any>> => {
            const {name, displayName, type = {}} = column;
            return {
                name,
                header: <DataTypePopup type={type}>{displayName ?? name}</DataTypePopup>,
                className: column.key || column.sort ? 'is-key' : undefined,
                accessor: (cells: Record<string, unknown> = {}) => cells[name],
                sortable: sortable && Boolean(type.simple),
                sortAccessor: (cells: Record<string, Node> = {}) => cells[name].$sortValue,
                render(data) {
                    if (typeof column.render === 'function') {
                        return column.render(data);
                    }

                    const {value, index} = data as any;
                    let formattedValue;
                    if (!value) {
                        return <span className="unipika">&lt;unsupported data type&gt;</span>;
                    }
                    if (Object.prototype.hasOwnProperty.call(value, '$formattedValue')) {
                        formattedValue = value.$formattedValue;
                    } else {
                        formattedValue = format(value, formatterSettings);
                    }
                    const rawValue = unquote(value.$rawValue ?? value.$value);
                    const fullFormattedValue = value.$fullFormattedValue ?? formattedValue;
                    let strippedDown: string;
                    if (
                        value.$type === 'yql.string' &&
                        formattedValue.startsWith('<span class="quote">')
                    ) {
                        strippedDown = formattedValue;
                    } else {
                        const lines = formattedValue.split('\n');
                        if (lines.length > MAX_NUMBER_OF_LINE_IS_DISPLAYED_IMMEDIATELY) {
                            strippedDown = lines.slice(0, NUMBER_OF_STRIPPED_LINES).join('\n');
                        } else {
                            strippedDown = formattedValue;
                        }
                    }
                    const isStrippedDown = strippedDown !== fullFormattedValue;

                    const additions = value.$additions ? (
                        <React.Fragment>
                            <br />
                            <Text color="light-hint">{value.$additions}</Text>
                        </React.Fragment>
                    ) : null;

                    const isTruncated: boolean = value.$incomplete;
                    const tag = value.$tagValue;

                    const handlePreviewClick = () => {
                        return onShowPreview(name, index, tag);
                    };

                    if (isStrippedDown) {
                        return (
                            <TableCell
                                rawValue={rawValue}
                                onPreviewClick={handlePreviewClick}
                                isTruncated={isTruncated}
                                tag={tag}
                            >
                                {showFullValueInDialog ? (
                                    <React.Fragment>
                                        <span
                                            className="unipika"
                                            dangerouslySetInnerHTML={{
                                                __html: strippedDown,
                                            }}
                                        />
                                    </React.Fragment>
                                ) : (
                                    <ShowMoreInline
                                        onClick={triggerWindowResize}
                                        strippedDown={strippedDown}
                                        formattedValue={fullFormattedValue}
                                    />
                                )}
                                {additions}
                            </TableCell>
                        );
                    }
                    return (
                        <TableCell
                            rawValue={rawValue}
                            onPreviewClick={handlePreviewClick}
                            isTruncated={isTruncated}
                            tag={tag}
                        >
                            <span
                                className="unipika"
                                dangerouslySetInnerHTML={{__html: formattedValue}}
                            />
                            {additions}
                        </TableCell>
                    );
                },
                align: type.numeric ? defaultNumberAlign : undefined,
            };
        });
        return columns;
    }, [
        header,
        sortable,
        defaultNumberAlign,
        format,
        formatterSettings,
        showFullValueInDialog,
        onShowPreview,
    ]);

    const calculatedStartIndex = (page - 1) * pageSize;
    const firstRowIndex = sortable ? 1 : (startIndex ?? calculatedStartIndex + 1);
    const sortedRows = React.useMemo(() => {
        return getSortedData(rows, columns, sortOrder, firstRowIndex);
    }, [rows, columns, sortOrder, firstRowIndex]);

    const [tableColumns, tableRows, tableTotals] = React.useMemo(() => {
        const filteredColumns: any[] = showColumns
            .map((name) => columns.find((item) => item.name === name))
            .filter(Boolean);
        const pageRows = sortedRows.slice(calculatedStartIndex, calculatedStartIndex + pageSize);
        if (!transpose) {
            return [filteredColumns, pageRows, totals];
        }
        const nameColumn = {
            name: 'name',
            header: 'Name',
        };

        const rowColumns = pageRows
            .map((row, index) => ({
                name: String(calculatedStartIndex + index),
                header: visualRowIndex(row),
                render: ({value}: {value: {data: any; column: any}}) => {
                    return value.column.render({value: value.data, row});
                },
            }))
            .concat(
                totals.map(({footerIndex}, index) => ({
                    name: `footer${index}`,
                    header: String(footerIndex ? footerIndex : index),
                    render: ({value}) => {
                        return value.column.render({value: value.data, footer: true});
                    },
                })),
            );

        const transposedRows = filteredColumns.map((column) => {
            const transposedRow: Record<string, any> = {
                name: column.name,
            };
            for (
                let index = calculatedStartIndex;
                index < calculatedStartIndex + pageSize;
                index++
            ) {
                if (index === sortedRows.length) {
                    break;
                }
                transposedRow[String(index)] = {
                    column: column,
                    data: sortedRows[index][column.name],
                };
            }
            totals.forEach((total, index) => {
                transposedRow[`footer${index}`] = {
                    column: column,
                    data: total[column.name],
                };
            });
            return transposedRow;
        });
        return [[nameColumn, ...rowColumns], transposedRows, []];
    }, [showColumns, sortedRows, calculatedStartIndex, pageSize, transpose, totals, columns]);

    if (resultType === 'table') {
        return (
            <div ref={containerRef} className={block(null, className)}>
                <DataTableYT
                    columns={tableColumns as any}
                    data={tableRows}
                    footerData={tableTotals.length === 0 ? undefined : tableTotals}
                    settings={transpose ? transposeTableSettings : tableSettings}
                    startIndex={firstRowIndex}
                    emptyDataMessage={emptyDataMessage}
                    theme={theme}
                    rowKey={rowKey}
                    sortOrder={sortOrder}
                    onSort={onSort}
                    visibleRowIndex={transpose ? undefined : (visualRowIndex as any)}
                />
            </div>
        );
    } else if (resultType === 'cell' || resultType === 'untyped') {
        return (
            <div ref={containerRef} className={block({mode: resultType}, className)}>
                <div className="unipika" dangerouslySetInnerHTML={{__html: rows[0].content}} />
            </div>
        );
    }
    return message ? <div className={block('message', {error: isError})}>{message}</div> : null;
}

type Comparator<T> = (v1: T, v2: T) => number;
function generateSortingFunction<T>(column: Column<T>, order: OrderType): Comparator<T> {
    const compareValue = order;

    return (row1, row2) => {
        let value1;
        let value2;
        if (typeof column.sortAccessor === 'function') {
            value1 = column.sortAccessor(row1);
            value2 = column.sortAccessor(row2);
        }

        if (Number.isNaN(value1) && !Number.isNaN(value2)) {
            return Number(compareValue);
        }
        if (Number.isNaN(value2) && !Number.isNaN(value1)) {
            return Number(-compareValue);
        }
        /* eslint-disable no-eq-null, eqeqeq */
        // Comparison with null made here intentionally
        // to exclude multiple comparison with undefined and null

        if (value1 == null && value2 != null) {
            return Number(-compareValue);
        }
        if (value2 == null && value1 != null) {
            return Number(compareValue);
        }
        /* eslint-enable no-eq-null, eqeqeq */

        if (value1 < value2) {
            return Number(-compareValue);
        }
        if (value1 > value2) {
            return Number(compareValue);
        }
        return 0;
    };
}

type WithIndex<T> = T & {[INDEX_COLUMN]: number};
function getSortedData<T>(
    data: T[],
    dataColumns: Column<T>[],
    sortOrder?: SortOrder | SortOrder[],
    startIndex = 0,
): WithIndex<T>[] {
    const indexedData = data.map((row, index) => ({[INDEX_COLUMN]: startIndex + index, ...row}));
    if (!sortOrder) {
        return indexedData;
    }
    const sortOrderArray = Array.isArray(sortOrder) ? sortOrder : [sortOrder];
    const sortColumns = sortOrderArray.reduce(
        (obj, {columnId, order}) => {
            obj[columnId] = order;
            return obj;
        },
        {} as Record<string, OrderType>,
    );
    const sortFunctionDict: {[colName: string]: Comparator<T>} = {};
    dataColumns.forEach((column) => {
        if (sortColumns[column.name]) {
            sortFunctionDict[column.name] = generateSortingFunction(
                column,
                sortColumns[column.name],
            );
        }
    });

    const sortFunctions = Object.keys(sortColumns)
        .map((name) => sortFunctionDict[name])
        .filter(Boolean);

    if (sortFunctions.length) {
        indexedData.sort((row1, row2) => {
            let comparison = 0;
            sortFunctions.some((sort) => {
                comparison = sort(row1, row2);
                return Boolean(comparison);
            });
            return comparison || row1[INDEX_COLUMN] - row2[INDEX_COLUMN];
        });
    }
    return indexedData;
}

function visualRowIndex<T>(row: WithIndex<T>) {
    return hammer.format['Number'](row[INDEX_COLUMN]);
}

interface ShowMoreInlineProps {
    formattedValue: string;
    strippedDown: string;
    onClick?(): void;
}
function ShowMoreInline({formattedValue, strippedDown, onClick}: ShowMoreInlineProps) {
    const [showFull, setShowFull] = React.useState(false);
    return (
        <React.Fragment>
            <span
                className="unipika"
                dangerouslySetInnerHTML={{
                    __html: showFull ? formattedValue : strippedDown,
                }}
            />
            <br />
            <ClickableText
                onClick={() => {
                    setShowFull((v) => !v);

                    onClick?.();
                }}
            >
                {showFull ? 'Show less' : 'Show more'}
            </ClickableText>
        </React.Fragment>
    );
}

function unquote(value?: string) {
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    return value;
}

const cellActionClassName = block('cell-action');

interface TableCellProps {
    children?: StrictReactNode;
    rawValue?: string;
    onPreviewClick: () => void;
    isTruncated?: boolean;
    tag?: string;
}

function TableCell({children, rawValue, onPreviewClick, isTruncated, tag}: TableCellProps) {
    const cellNodeRef = React.useRef<HTMLDivElement>(null);
    const [mount, setMount] = React.useState(false);

    React.useEffect(() => {
        const parent = cellNodeRef.current?.parentElement;

        function handleMouseOver() {
            setMount(true);
        }
        function handleMouseOut(e: MouseEvent) {
            if (!parent?.contains(e.relatedTarget as any)) {
                setMount(false);
            }
        }
        parent?.addEventListener('mouseover', handleMouseOver);
        parent?.addEventListener('mouseout', handleMouseOut);

        return () => {
            parent?.removeEventListener('mouseover', handleMouseOver);
            parent?.removeEventListener('mouseout', handleMouseOut);
        };
    }, []);

    const isTruncatedTaggedType = Boolean(tag && isTruncated);

    const [isPreviewInProgress, setPreviewInProgress] = React.useState(false);

    return (
        <span ref={cellNodeRef}>
            {isTruncatedTaggedType ? (
                <Label theme="warning" text={`Incomplete '${tag}' type`} />
            ) : (
                <span className={block('cell-content')}>{children}</span>
            )}
            {(mount || isTruncatedTaggedType) && (
                <>
                    {rawValue && !isTruncated && (
                        <ClipboardButton className={cellActionClassName} text={rawValue} size="s" />
                    )}
                    {isTruncated && (
                        <Button
                            className={cellActionClassName}
                            view="flat-secondary"
                            size="s"
                            loading={isPreviewInProgress}
                            onClick={async () => {
                                try {
                                    setPreviewInProgress(true);
                                    if (!isPreviewInProgress) {
                                        await onPreviewClick();
                                    }
                                } finally {
                                    setPreviewInProgress(false);
                                }
                            }}
                        >
                            <UIKitIcon data={Eye} size="12" />
                        </Button>
                    )}
                </>
            )}
        </span>
    );
}
