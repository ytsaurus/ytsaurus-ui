import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import React, {CSSProperties, Component} from 'react';

import {SelectOption} from '@gravity-ui/uikit';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import {ChangeColumnSortOrderParams, ToggleColumnSortOrderParams} from '../../store/actions/tables';
import {RootState} from '../../store/reducers';
import {OldSortState} from '../../types';
import {OrderType, oldSortStateToOrderType} from '../../utils/sort-helpers';
import SortIcon from '../SortIcon/SortIcon';
import {HeaderSortSelect} from './HeaderSortSelect';
import {
    ELEMENTS_TABLE,
    TemplatesPropType,
    getColumnCaption,
    getColumnEdgePosition,
    prepareCellClassName,
    prepareColumnsData,
    prepareGroupCellClassName,
} from './utils';

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
    changeColumnSortOrder: (params: ChangeColumnSortOrderParams) => void;

    //sortInfo?: () => OldSortState;
    tableId: keyof RootState['tables'];
    sortState?: Record<string, OldSortState>;
    onSort?: (columnName?: string) => void;

    columns: ColumnsItem;

    itemHeight?: number;
    selectedIndex?: number;
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
    columnSelects: Record<string, string>;
}

interface ColumnGroupInfo {
    groupName: string;
    groupFirstItem?: boolean;
    headerStyle?: CSSProperties;
    groupCount?: number;
    groupId?: string;

    tooltipProps?: undefined;
    sort?: undefined;
    render?: undefined;
    sortWithUndefined?: undefined;
    allowedOrderTypes?: undefined;
    sortSelectItems: SelectOption[];

    caption?: React.ReactNode;
    captionTail?: React.ReactNode; // rendered after sort-order icon
}

interface ColumnInfo {
    tooltipProps?: {
        className?: string;
    };
    sort?: boolean;
    sortSelectItems: SelectOption[];
    sortWithUndefined?: boolean;
    allowedOrderTypes?: Array<OrderType>;

    render: React.ComponentType;

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
    };

    constructor(props: ElementsTableHeaderProps) {
        super(props);

        this.state = {
            columnItems: {},
            columnSet: {
                items: [],
            },
            columnSelects: {},
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

        if (column?.render) {
            return <column.render />;
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
        const {sortState, onSort} = this.props;
        const {columnItems} = this.state;
        const {sortSelectItems} = columnItems[columnName];

        const {sortWithUndefined, allowedOrderTypes} = this.state.columnItems[columnName];
        let sortInfo: OldSortState | undefined;
        let toggleOrder: (selectField?: string) => void;
        const defaultSelectValue = sortSelectItems?.length ? [sortSelectItems[0].value] : undefined;
        const {tableId, toggleColumnSortOrder, changeColumnSortOrder} = this.props;

        if (sortState) {
            sortInfo = sortState[tableId!];
            toggleOrder = (selectField?: string) => {
                toggleColumnSortOrder({
                    tableId,
                    columnName,
                    withUndefined: sortWithUndefined,
                    allowedOrderTypes,
                    selectField,
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
            <div
                className="column-header"
                onClick={() => {
                    toggleOrder(this.state.columnSelects[columnName] ?? defaultSelectValue?.[0]);

                    if (
                        sortSelectItems.length &&
                        defaultSelectValue &&
                        !this.state.columnSelects[columnName]
                    ) {
                        this.setState({
                            columnSelects: {
                                [columnName]: defaultSelectValue[0],
                            },
                        });
                    }
                }}
            >
                {this.renderCellCaption(columnName)}
                <SortIcon className={b('cell-sort')} order={orderType} />
                <HeaderSortSelect
                    changeColumnSortOrder={changeColumnSortOrder}
                    value={this.state.columnSelects[columnName]}
                    orderType={orderType}
                    columnName={columnName}
                    tableId={tableId}
                    defaultValue={defaultSelectValue}
                    sortSelectItems={sortSelectItems}
                    onChange={(columnName: string, selectField: string) => {
                        this.setState({
                            columnSelects: {
                                [columnName]: selectField,
                            },
                        });
                    }}
                />
                {this.renderCellCaptionTail(columnName)}
            </div>
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
        const headerClassName = b('head');

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
