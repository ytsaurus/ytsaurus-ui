// import ElementsTable from "components/ElementsTable/ElementsTable"
// import React from "react"

import {Column, Settings} from '@yandex-cloud/react-data-table';
import React, {useMemo} from 'react';
import {QueryItem, YQLSstatistics} from '../../module/api';
import {StrictReactNode} from '../YQLTable/utils';
import CollapsibleTable, {TableState} from './CollapsibleTable/CollapsibleTable';
import {FilterInfo, Row, RowTree, SortInfo} from './CollapsibleTable/utils';
import block from 'bem-cn-lite';

import './index.scss';
import {MOVING} from '@yandex-cloud/react-data-table/build/esm/lib/constants';

const metrics = ['min', 'max', 'avg', 'sum', 'count'];

function getIsFinalObject(value: unknown) {
    if (typeof value !== 'object') {
        return true;
    }
    return (
        typeof value === 'object' &&
        value !== null &&
        (Object.values(value).length === 0 || typeof Object.values(value)[0] !== 'object')
    );
}

function isStatistic(value: unknown) {
    return !(
        typeof value === 'object' &&
        value !== null &&
        Object.keys(value).some((key) => metrics.includes(key))
    );
}

function setValue(obj: YQLSstatistics, keys: string[], value: YQLSstatistics) {
    let curr = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!curr[key]) {
            curr[key] = {};
        }
        curr = curr[key];
    }
    curr[keys[keys.length - 1]] = value;
}

function expandMetricsTree(statistics: YQLSstatistics) {
    if (typeof statistics !== 'object' || !statistics) {
        return statistics;
    }
    const tree = {};
    Object.keys(statistics).forEach((key) => {
        setValue(tree, key.split('/'), expandMetricsTree(statistics[key]));
    });

    return tree;
}

function createRowTree(statistics?: YQLSstatistics): RowTree[] {
    if (!statistics) {
        return [];
    }

    const recurse = (statistics: YQLSstatistics, path = '', level = 0): RowTree[] => {
        const rows = [];

        for (const [name, value] of Object.entries(statistics)) {
            const isFinalObject = getIsFinalObject(value);
            const key: string = path === '' ? name : `${path}/${name}`;
            const parent = path || null;
            const children = isFinalObject ? [] : recurse(value, key, level + 1);
            let row: RowTree = {key, name, level, children, parent};

            if (isFinalObject) {
                row = {...row, ...value};
            }

            if ((isFinalObject && !isStatistic(value)) || children.length > 0) {
                rows.push(row);
            }
        }

        return rows;
    };

    const preparedStatistics = expandMetricsTree(statistics);
    const v = recurse(preparedStatistics);
    return v;
}

function getFilterInfo(filter: string): FilterInfo {
    return {
        filter,
        selector(row: RowTree) {
            return row.name;
        },
    };
}

function getSortInfo(asc: boolean): SortInfo {
    return {
        asc,
        selector(row: RowTree) {
            return row.name;
        },
    };
}

function render({value}: {value?: unknown}) {
    return (value ?? '–') as StrictReactNode;
}

const columns: Column<Row>[] = [
    {name: 'name', header: 'Metric', sortable: false},
    {name: 'min', header: 'min', sortable: false, align: 'right', width: 120, render},
    {name: 'max', header: 'max', sortable: false, align: 'right', width: 120, render},
    {name: 'avg', header: 'avg', sortable: false, align: 'right', width: 120, render},
    {name: 'sum', header: 'sum', sortable: false, align: 'right', width: 120, render},
    {name: 'count', header: 'count', sortable: false, align: 'right', width: 120, render},
];

const settings: Settings = {
    displayIndices: false,
    stickyHead: MOVING,
    stickyTop: 0,
};

const b = block('yql-statistics-table');

export function YQLStatisticsTable({query}: {query: QueryItem}) {
    const [filter, _] = React.useState('');
    const [tableState, setTableState] = React.useState<TableState>('expanded');
    const filterInfo = useMemo(() => getFilterInfo(filter), [filter]);
    const sortInfo = useMemo(() => getSortInfo(true), []);
    const statistics = useMemo(() => {
        return createRowTree(query.progress?.yql_statistics);
    }, [query.progress?.yql_statistics]);
    return (
        <div className={b()}>
            <CollapsibleTable
                theme="yandex-cloud"
                data={statistics}
                columns={columns}
                sortInfo={sortInfo}
                filterInfo={filterInfo}
                settings={settings}
                tableState={tableState}
                onTableStateChange={setTableState}
            />
        </div>
    );
}
