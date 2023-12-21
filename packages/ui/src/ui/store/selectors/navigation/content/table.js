import _ from 'lodash';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import {createSelector} from 'reselect';

import {getAttributes} from '../../../../store/selectors/navigation';
import {shouldUseYqlTypes} from '../../../../store/selectors/settings';

import Columns from '../../../../utils/navigation/content/table/columns';
import Query from '../../../../utils/navigation/content/table/query';
import {getColumnsValues} from '../../../../utils/navigation/content/table/table';
import {
    getColumns,
    getColumnsOrder,
    getColumnsPreset,
    getColumnsPresetHash,
    getIsDynamic,
    getLoaded,
    getLoading,
    getMoveOffsetBackward,
    getNextOffsetValue,
    getOffsetMode,
    getOffsetString,
    getOmittedColumns,
    getPageSize,
    getRows,
    getYqlTypes,
} from './table-ts';

export const getKeyColumns = createSelector(getAttributes, (attributes) =>
    Columns.getKeyColumns(attributes),
);

export const getVisibleColumns = createSelector(
    [getColumns, getColumnsOrder, getColumnsPreset, getColumnsPresetHash],
    (columns, columnsOrder, columnsPreset, columnsPresetHash) => {
        const visibleColumns = _.filter(columns, (column) => {
            // use columns preset first
            if (columnsPresetHash && columnsPreset) {
                return columnsPreset.columns.includes(column.name);
            }

            // or fallback to old way
            return column.checked;
        });

        return Columns.orderColumns(visibleColumns, columnsOrder);
    },
);

export const getAllColumns = createSelector(
    [getColumns, getOmittedColumns],
    (columns, omittedColumns) => _.concat(columns, omittedColumns),
);

export const getSrcColumns = createSelector(
    [getAttributes, getAllColumns],
    (attributes, allColumns) => Columns.prepareSrcColumns(attributes, allColumns),
);

export const getTableType = createSelector(
    [getAttributes, getIsDynamic],
    (attributes, isDynamic) => {
        if (isDynamic) {
            const [upstreamReplicaID, type] = ypath.getValues(attributes, [
                '/upstream_replica_id',
                '/type',
            ]);
            if (String(type).startsWith('chaos')) {
                return 'chaos';
            }
            if (upstreamReplicaID && upstreamReplicaID !== '0-0-0-0') {
                return 'replica';
            }
            return 'dynamic';
        } else {
            return 'static';
        }
    },
);

// request one more item per page to detect reaching end of the table
export const getRequestedPageSize = createSelector(getPageSize, (pageSize) => pageSize + 1);

export const getRowCount = createSelector(getAttributes, (attributes) =>
    ypath.getValue(attributes, '/chunk_row_count'),
);

// show one item less than requested unless we got less items than requested
// This allows to know what the first key of the next page is without
// actually requesting the next page. This, in turn, allows to a) show pages of
// not overlapping items and b) have the same item as first item in page and the page offset
export const getVisibleRows = createSelector(
    [getRows, getRequestedPageSize, getPageSize],
    (rows, requestedPageSize, pageSize) => {
        return rows.length < requestedPageSize ? rows : rows.slice(0, pageSize);
    },
);

export const getIsAllKeyColumnsSelected = createSelector(
    [getKeyColumns, getVisibleColumns],
    (keyColumns, visibleColumnsItems) => {
        const visibleColumns = _.map(visibleColumnsItems, ({name}) => name);

        return _.difference(keyColumns, visibleColumns).length === 0;
    },
);

export const getIsPaginationDisabled = createSelector(
    [getIsDynamic, getIsAllKeyColumnsSelected, getLoading, getLoaded],
    (isDynamic, isAllKeyColumnsSelected, loading, loaded) => {
        const initialLoading = loading && !loaded;

        return (isDynamic && !isAllKeyColumnsSelected) || initialLoading;
    },
);

export const getIsTableEndReached = createSelector(
    [getRows, getRequestedPageSize],
    (rows, requestedPageSize) => {
        return rows.length < requestedPageSize;
    },
);

export const getUpperBoundKey = createSelector([getRows, getKeyColumns], (rows, keyColumns) => {
    const row = rows[rows.length - 1];

    return getColumnsValues(row, keyColumns);
});

export const getBottomBoundKey = createSelector([getRows, getKeyColumns], (rows, keyColumns) => {
    const row = rows[0];

    return getColumnsValues(row, keyColumns);
});

export const getCurrentOffsetValues = createSelector(
    [getColumns, getBottomBoundKey, getYqlTypes],
    (columns, offsetValues, yqlTypes) => {
        return _.filter(columns, (column) => column.keyColumn).map(({name, checked}, index) => {
            return {
                name,
                checked,
                value: offsetValues && Query.prepareColumnValue(offsetValues[index], yqlTypes),
            };
        });
    },
);

export const getOffsetValue = createSelector(
    [getOffsetString, getOffsetMode],
    (offsetString, offsetMode) => {
        return offsetMode === 'row' ? Number(offsetString) : offsetString;
    },
);
export const getNextOffset = createSelector(
    [getNextOffsetValue, getMoveOffsetBackward, getOffsetMode],
    (offsetValue, moveBackward, offsetMode) => {
        return {
            offsetValue: offsetMode === 'row' ? Number(offsetValue) : offsetValue,
            moveBackward,
        };
    },
);

export const getIsTableSorted = createSelector([getAttributes], (attributes) => {
    return ypath.getValue(attributes, '/sorted');
});

export const getProgressWidth = createSelector(
    [getOffsetValue, getRowCount],
    (currentRow, totalRow) => {
        const percent = Math.round((100 * (currentRow + 1)) / totalRow);

        if (currentRow === 0) {
            return '0%';
        }

        return percent < 100 ? `calc(${percent}% + 2px)` : 'calc(100% + 2px)';
    },
);

export const isYqlSchemaExists = createSelector([getAttributes], (attributes) => {
    const schema = ypath.getValue(attributes, '/schema');
    const _readSchema = ypath.getValue(attributes, '/_read_schema');

    return Boolean(
        (schema && schema.length) ||
            (_readSchema && _readSchema.length) ||
            ypath.getValue(attributes, '/_yql_row_spec') ||
            ypath.getValue(attributes, '/_yql_row_spec') ||
            ypath.getValue(attributes, '/_yql_key_meta') ||
            ypath.getValue(attributes, '/_yql_subkey_meta') ||
            ypath.getValue(attributes, '/_yql_value_meta') ||
            ypath.getValue(attributes, '/_format') === 'yamred_dsv',
    );
});

export const isYqlTypesEnabled = createSelector(
    [shouldUseYqlTypes],
    (isSettingEnabled) => isSettingEnabled,
);
