import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import mapValues_ from 'lodash/mapValues';
import map_ from 'lodash/map';

import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import {tableItems} from '../../../utils/navigation/tabs/tables';

function prepareFlatColumns(columns, flatColumns = {}, prefix) {
    const correctPrefix = prefix ? prefix + '_' : '';

    forEach_(columns, (column, columnName) => {
        if (column.group) {
            prepareFlatColumns(column.items, flatColumns, columnName);
        } else {
            const flatColumnName = correctPrefix + columnName;
            flatColumns[flatColumnName] = column;
        }
    });

    return flatColumns;
}

export function prepareDataForColumns(collection) {
    const preparedColumns = prepareFlatColumns(tableItems);

    return map_(collection, (item) => {
        return mapValues_(preparedColumns, (column) => {
            return typeof column.get === 'function' ? column.get(item) : undefined;
        });
    });
}

export function prepareAggregation(preparedCollection) {
    let preparedColumns = map_(prepareFlatColumns(tableItems), (column, columnName) => ({
        name: columnName,
        type: column.overall,
    }));
    preparedColumns = filter_(preparedColumns, 'type');

    const aggregation = hammer.aggregation.prepare(preparedCollection, preparedColumns)[0];
    aggregation['index'] = 'aggregation';

    return aggregation;
}

export function getStorePreloadValues(tablet) {
    return {
        completed: Number(ypath.getValue(tablet, '/statistics/preload_completed_store_count')),
        failed: Number(ypath.getValue(tablet, '/statistics/preload_failed_store_count')),
        pending: Number(ypath.getValue(tablet, '/statistics/preload_pending_store_count')),
    };
}
