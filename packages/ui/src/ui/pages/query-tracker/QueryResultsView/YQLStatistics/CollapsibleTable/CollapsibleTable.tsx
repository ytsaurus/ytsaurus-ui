import * as React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import DataTable, {Column, DataTableProps} from '@gravity-ui/react-data-table';
import {isEqual} from 'lodash';
import cn from 'bem-cn-lite';
import {
    FilterInfo,
    Row,
    RowTree,
    RowsMap,
    SortInfo,
    copyTree,
    filterTree,
    flattenTree,
    sortTree,
} from './utils';

import collapse from '../../../../../assets/img/svg/icons/chevron-up.svg';
import expand from '../../../../../assets/img/svg/icons/chevron-down.svg';

import './CollapsibleTable.scss';
import {StrictReactNode} from '../../YQLTable/utils';

type ExpandedState = Record<string, boolean>;
type OnVisibleChange = (p1: string, p2: boolean) => void;
export type TableState = 'expanded' | 'collapsed' | 'mixed';

interface Cell {
    row: Row;
    value?: unknown;

    onChange?: OnVisibleChange;
    visible?: boolean;
}

interface CollapsibleTableProps extends Omit<DataTableProps<Row>, 'data' | 'columns'> {
    data: RowTree[];
    columns: Column<Row>[];
    filterInfo: FilterInfo;
    sortInfo: SortInfo;
    tableState: TableState;
    onTableStateChange: (s: TableState) => void;
}

const block = cn('collapsible-table');
const cellBlock = cn('collapsible-table-cell');

function prepareColumns(
    columns: Column<Row>[],
    state: ExpandedState,
    onVisibleChange: OnVisibleChange,
): Column<Row>[] {
    return columns.map((column, index) => {
        if (index === 0) {
            return {
                ...column,
                render(props) {
                    const visible = state[props.row.key];
                    return (
                        <CollapsibleCell onChange={onVisibleChange} visible={visible} {...props} />
                    );
                },
            };
        }

        return column;
    });
}

function prepareExpandedState(tree: RowTree[], tableState: TableState): ExpandedState {
    const rows = flattenTree(tree);
    const visible = tableState !== 'collapsed';
    return rows.reduce((res: ExpandedState, row) => {
        res[row.key] = visible;
        return res;
    }, {});
}

function getAllChildKeys(key: string, rowsMap: RowsMap, level = 0): string[] {
    const row: Row = rowsMap[key];

    if (!row || row.children.length === 0) {
        return level === 0 ? [] : [key];
    }

    const childKeys = row.children.reduce((res: string[], childKey) => {
        return [...res, ...getAllChildKeys(childKey, rowsMap, level + 1)];
    }, []);

    return level === 0 ? childKeys : [key, ...childKeys];
}

function prepareRowsMap(rows: Row[]): RowsMap {
    return rows.reduce((acc: RowsMap, node) => {
        acc[node.key] = node;
        return acc;
    }, {});
}

function filterCollapsedRows(rows: Row[], state: ExpandedState): Row[] {
    const rowsMap = prepareRowsMap(rows);
    const collapsed = Object.entries(state)
        .filter(([_, visible]) => !visible)
        .map(([key]) => key);

    if (collapsed.length === 0) {
        return rows;
    }

    const closed = collapsed.reduce((res: string[], collapsedKey) => {
        return [...res, ...getAllChildKeys(collapsedKey, rowsMap)];
    }, []);

    return rows.filter((row) => !closed.includes(row.key));
}

function prepareRows(tree: RowTree[], state: ExpandedState): Row[] {
    const rows = flattenTree(tree);
    return filterCollapsedRows(rows, state);
}

function prepareTree(tree: RowTree[], sortInfo: SortInfo, filterInfo: FilterInfo): RowTree[] {
    const copiedTree = copyTree(tree);
    const filteredTree = filterTree(copiedTree, filterInfo);
    return sortTree(filteredTree, sortInfo);
}

const collapseIcon = <Icon data={collapse} size={10} />;
const expandIcon = <Icon data={expand} size={10} />;

function CollapsibleCell({value, row, visible, onChange}: Cell) {
    const [expanded, toggleExpanded] = React.useState(visible);
    const collapsible = row.children.length > 0;

    React.useEffect(() => {
        toggleExpanded(visible);
    }, [visible]);

    const onClick = React.useCallback(() => {
        toggleExpanded((prevExpanded) => {
            if (typeof onChange === 'function') {
                onChange(row.key, !prevExpanded);
            }
            return !prevExpanded;
        });
    }, [row.key, onChange]);

    return (
        <div className={cellBlock({collapsible, level: row.level > 5 ? 'max' : String(row.level)})}>
            {collapsible ? (
                <div className={cellBlock('toggler', {type: expanded ? 'collapse' : 'expand'})}>
                    <Button
                        view="flat-secondary"
                        onClick={onClick}
                        title={expanded ? 'collapse' : 'expand'}
                        extraProps={{'aria-expanded': expanded}}
                    >
                        {expanded ? collapseIcon : expandIcon}
                    </Button>
                </div>
            ) : null}
            <span className={cellBlock('value')}>{value as StrictReactNode}</span>
        </div>
    );
}

export default function CollapsibleTable({
    data,
    columns,
    settings,
    tableState,
    onTableStateChange,
    filterInfo,
    sortInfo,
    ...props
}: CollapsibleTableProps) {
    const [expandedState, setExpandedState] = React.useState(() =>
        prepareExpandedState(data, tableState),
    );

    const onVisibleChange = React.useCallback<Required<Cell>['onChange']>(
        (key, visible) => {
            setExpandedState((prevState) => ({...prevState, [key]: visible}));
            onTableStateChange('mixed');
        },
        [onTableStateChange],
    );

    const preparedTree = React.useMemo(
        () => prepareTree(data, sortInfo, filterInfo),
        [data, sortInfo, filterInfo],
    );
    const tableRows = React.useMemo(
        () => prepareRows(preparedTree, expandedState),
        [preparedTree, expandedState],
    );
    const tableColumns = React.useMemo(
        () => prepareColumns(columns, expandedState, onVisibleChange),
        [columns, expandedState, onVisibleChange],
    );

    React.useEffect(() => {
        if (tableState !== 'mixed') {
            setExpandedState((prevState) => {
                const newState = prepareExpandedState(data, tableState);
                if (isEqual(prevState, newState)) {
                    return prevState;
                }
                return newState;
            });
        }
    }, [data, tableState]);

    React.useEffect(() => {
        if (filterInfo.filter !== '') {
            onTableStateChange('expanded');
        }
    }, [filterInfo.filter, onTableStateChange]);

    return (
        <div className={block()}>
            <DataTable columns={tableColumns} data={tableRows} settings={settings} {...props} />
        </div>
    );
}
