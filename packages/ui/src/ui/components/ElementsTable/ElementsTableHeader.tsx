import React, {CSSProperties, Component} from 'react';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {
    ELEMENTS_TABLE,
    TemplatesPropType,
    getColumnCaption,
    getColumnEdgePosition,
    prepareCellClassName,
    prepareColumnsData,
    prepareGroupCellClassName,
} from './utils';
import {OldSortState} from '../../types';
import {OrderType, oldSortStateToOrderType} from '../../utils/sort-helpers';
import SortIcon from '../../components/SortIcon/SortIcon';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {ToggleColumnSortOrderParams} from '../../store/actions/tables';
import {RootState} from '../../store/reducers';

const b = block(ELEMENTS_TABLE);

export const sortStateType = PropTypes.shape({
    field: PropTypes.string,
    asc: PropTypes.bool,
});

export interface ElementsTableHeaderProps {
    css?: string;
    templates?: unknown;
    size: string;
    theme: string;
    padded: boolean;
    striped: boolean;

    items: Array<unknown>;
    //computeKey: () => void;
    onItemClick?: () => void;
    onItemHover?: () => void;

    toggleColumnSortOrder: (params: ToggleColumnSortOrderParams) => void;

    //sortInfo?: () => OldSortState;
    tableId: keyof RootState['tables'];
    sortState?: Record<string, OldSortState>;
    onSort?: (columnName?: string) => void;

    columns: ColumnsItem;

    itemHeight?: number;
    selectedIndex?: number;
    headerClassName?: string;
}

interface ColumnsItem {
    items: Array<{
        sort?: boolean;
        sortWithUndefined?: boolean;
    }>;
    sets: unknown;
    mode: string;
}

interface State {
    columnItems: Record<string, ColumnGroupInfo | ColumnInfo>;
    columnSet: {
        items: Array<string>;
        hasGroups?: boolean;
    };
}

interface ColumnGroupInfo {
    groupName: string;
    groupFirstItem?: boolean;
    headerStyle?: CSSProperties;
    groupCount?: number;
    groupId?: string;

    tooltipProps?: undefined;
    sort?: undefined;
    renderHeader?: undefined;
    sortWithUndefined?: undefined;
    allowedOrderTypes?: undefined;

    caption?: React.ReactNode;
    captionTail?: React.ReactNode; // rendered after sort-order icon
}

export interface ColumnInfo {
    align?: 'left' | 'right' | 'center';

    tooltipProps?: {
        className?: string;
    };
    sort?: boolean;
    sortWithUndefined?: boolean;
    allowedOrderTypes?: Array<OrderType>;

    renderHeader?: (column: ColumnInfo) => React.ReactNode;

    groupName?: undefined;

    caption?: React.ReactNode;
    captionTail?: React.ReactNode; // rendered after sort-order icon
}

interface CellProps {
    style?: CSSProperties;
    colSpan?: number;
    rowSpan?: number;
    className?: string;
    key?: string;
}

export default class ElementsTableHeader extends Component<ElementsTableHeaderProps, State> {
    static propTypes = {
        css: PropTypes.string,
        templates: TemplatesPropType.isRequired,
        size: PropTypes.string.isRequired,
        theme: PropTypes.string.isRequired,
        padded: PropTypes.bool.isRequired,
        striped: PropTypes.bool.isRequired,
        // ITEMS
        items: PropTypes.array.isRequired,
        computeKey: PropTypes.func,
        onItemClick: PropTypes.func,
        onItemHover: PropTypes.func,
        // old SORT
        sortInfo: PropTypes.func, // ko.param, old tables
        // new SORT
        tableId: PropTypes.string,
        sortState: sortStateType,
        // COLUMNS
        columns: PropTypes.shape({
            items: PropTypes.object.isRequired,
            sets: PropTypes.object.isRequired,
            mode: PropTypes.string.isRequired,
        }).isRequired,
        // VIRTUAL RENDERING
        itemHeight: PropTypes.number,
        // ROW SELECTION
        selectedIndex: PropTypes.number,
        headerClassName: PropTypes.string,
    };

    constructor(props: ElementsTableHeaderProps) {
        super(props);

        this.state = {
            columnItems: {},
            columnSet: {
                items: [],
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    static getDerivedStateFromProps(props: ElementsTableHeaderProps) {
        const {columns} = props;
        const {items, set} = prepareColumnsData(columns);

        return {
            columnItems: items,
            columnSet: set,
        };
    }

    isColumnSortable(columnName: string) {
        const {columnItems} = this.state;
        const sortable = columnItems[columnName].sort;

        return typeof sortable === 'function' || (typeof sortable === 'boolean' && sortable);
    }

    renderCellCaptionTail(columnName: string) {
        const {columnItems} = this.state;
        const column = columnItems[columnName];

        return column?.captionTail || null;
    }

    renderCellCaption(columnName: string) {
        const {columnItems} = this.state;
        const column = columnItems[columnName];
        const withTooltip = Boolean(column?.tooltipProps);
        const content = getColumnCaption(column, columnName);
        const {className: tooltipClassName, ...restTooltipProps} = column?.tooltipProps || {};

        if (column?.renderHeader) {
            return column.renderHeader(column);
        }

        return withTooltip ? (
            <Tooltip {...restTooltipProps} className={b('column-name', tooltipClassName)}>
                {content}
            </Tooltip>
        ) : (
            <div
                className={b('column-name')}
                title={typeof content === 'string' ? content : undefined}
            >
                {content}
            </div>
        );
    }

    renderSortableHeaderCaption(columnName: string) {
        const className = block('yc-link')({view: 'primary'});
        const {sortState, onSort} = this.props;

        const {sortWithUndefined, allowedOrderTypes} = this.state.columnItems[columnName];

        let sortInfo: OldSortState | undefined;
        let sortQuery, toggleOrder;
        if (sortState) {
            const {tableId, toggleColumnSortOrder} = this.props;
            sortInfo = sortState[tableId!];
            toggleOrder = () => {
                toggleColumnSortOrder({
                    tableId,
                    columnName,
                    withUndefined: sortWithUndefined,
                    allowedOrderTypes,
                });
                if (typeof onSort === 'function') {
                    onSort(columnName);
                }
            };
        }

        const orderType = oldSortStateToOrderType(
            sortInfo?.field === columnName ? sortInfo : undefined,
        );

        return (
            <a className={className} href={sortQuery} onClick={toggleOrder}>
                {this.renderCellCaption(columnName)}
                <SortIcon className={b('cell-sort')} order={orderType} />
                {this.renderCellCaptionTail(columnName)}
            </a>
        );
    }

    renderHeaderCell(columnName: string, edgePosition: 'start' | 'end') {
        const {columnItems} = this.state;
        const cellClassName = prepareCellClassName(
            columnItems,
            columnName,
            this.props.css,
            edgePosition,
        );

        return (
            <th className={cellClassName} key={columnName}>
                {this.isColumnSortable(columnName) ? (
                    this.renderSortableHeaderCaption(columnName)
                ) : (
                    <React.Fragment>
                        {this.renderCellCaption(columnName)}
                        {this.renderCellCaptionTail(columnName)}
                    </React.Fragment>
                )}
            </th>
        );
    }

    renderHeaderGroupCell(
        columnName: string,
        groupRowPlacement: 'top' | 'bottom',
        edgePosition: 'start' | 'end',
    ): React.ReactNode {
        const {columnItems} = this.state;
        const {css} = this.props;
        const column = columnItems[columnName];
        const cellClassName = prepareCellClassName(columnItems, columnName, css, edgePosition);
        const cellProps: CellProps = {
            key: columnName,
            className: cellClassName,
        };
        let caption = this.isColumnSortable(columnName)
            ? this.renderSortableHeaderCaption(columnName)
            : this.renderCellCaption(columnName);

        if (groupRowPlacement === 'top') {
            if (column.groupName) {
                if (column.groupFirstItem) {
                    caption = this.renderCellCaption(column.groupName);
                    cellProps.style = column.headerStyle;
                    cellProps.colSpan = column.groupCount;
                    cellProps.className = prepareGroupCellClassName(
                        column.groupId,
                        css,
                        edgePosition,
                    );
                } else {
                    return null;
                }
            } else {
                cellProps.rowSpan = 2;
            }
        }

        if (groupRowPlacement === 'bottom' && !column.groupName) {
            return null;
        }

        return <th {...cellProps}>{caption}</th>;
    }

    renderHeaderGroupRow(placement: 'top' | 'bottom') {
        const {columnSet, columnItems} = this.state;

        return (
            <tr className={b('row')}>
                {columnSet.items.map((columnName, index) =>
                    this.renderHeaderGroupCell(
                        columnName,
                        placement,
                        getColumnEdgePosition(columnSet, columnItems, index, placement)!,
                    ),
                )}
            </tr>
        );
    }

    renderHeaderRow() {
        const {columnSet, columnItems} = this.state;

        return (
            <tr className={b('row')}>
                {columnSet.items.map((columnName, index) =>
                    this.renderHeaderCell(
                        columnName,
                        getColumnEdgePosition(columnSet, columnItems, index)!,
                    ),
                )}
            </tr>
        );
    }

    render() {
        const {columnSet} = this.state;
        const hasGroups = columnSet.hasGroups;
        const headerClassName = b('head', this.props.headerClassName);

        return hasGroups ? (
            <thead className={headerClassName}>
                {this.renderHeaderGroupRow('top')}
                {this.renderHeaderGroupRow('bottom')}
            </thead>
        ) : (
            <thead className={headerClassName}>{this.renderHeaderRow()}</thead>
        );
    }
}
