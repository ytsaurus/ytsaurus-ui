import concat_ from 'lodash/concat';
import difference_ from 'lodash/difference';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';

import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import unipika from '../../../../common/thor/unipika';
import {createSelector} from 'reselect';

import {selectAttributes} from '../../../../store/selectors/navigation';
import {selectShouldUseYqlTypes} from '../../../../store/selectors/settings/settings-development';

import Columns from '../../../../utils/navigation/content/table/columns';
import {Query} from '../../../../utils/navigation/content/table/query';
import {getColumnsValues} from '../../../../utils/navigation/content/table/table';
import {
    selectColumns,
    selectColumnsOrder,
    selectColumnsPreset,
    selectColumnsPresetHash,
    selectIsDynamic,
    selectKeyColumns,
    selectLoaded,
    selectLoading,
    selectMoveOffsetBackward,
    selectNextOffsetValue,
    selectOffsetMode,
    selectOffsetString,
    selectOmittedColumns,
    selectPageSize,
    selectRows,
    selectYqlTypes,
} from './table-ts';
import {getTableTypeByAttributes} from '../../../../utils/navigation/getTableTypeByAttributes';

export const selectVisibleColumns = createSelector(
    [selectColumns, selectColumnsOrder, selectColumnsPreset, selectColumnsPresetHash],
    (columns, columnsOrder, columnsPreset, columnsPresetHash) => {
        const visibleColumns = filter_(columns, (column) => {
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

export const selectDecodedVisibleColumns = createSelector([selectVisibleColumns], (columns) => {
    return columns.map((data) => {
        return {...data, name: unipika.decode(data.name)};
    });
});

export const selectAllColumns = createSelector(
    [selectColumns, selectOmittedColumns],
    (columns, omittedColumns) => concat_(columns, omittedColumns),
);

export const selectSrcColumns = createSelector(
    [selectAttributes, selectAllColumns],
    (attributes, allColumns) => Columns.prepareSrcColumns(attributes, allColumns),
);

export const selectTableType = createSelector(
    [selectAttributes, selectIsDynamic],
    (attributes, isDynamic) => {
        return getTableTypeByAttributes(isDynamic, attributes);
    },
);

// request one more item per page to detect reaching end of the table
export const selectRequestedPageSize = createSelector(selectPageSize, (pageSize) => pageSize + 1);

export const selectRowCount = createSelector(selectAttributes, (attributes) => {
    /** @type {number} */
    const res = ypath.getValue(attributes, '/chunk_row_count');
    return res;
});

// show one item less than requested unless we got less items than requested
// This allows to know what the first key of the next page is without
// actually requesting the next page. This, in turn, allows to a) show pages of
// not overlapping items and b) have the same item as first item in page and the page offset
export const selectVisibleRows = createSelector(
    [selectRows, selectRequestedPageSize, selectPageSize],
    (rows, requestedPageSize, pageSize) => {
        return rows.length < requestedPageSize ? rows : rows.slice(0, pageSize);
    },
);

export const selectIsAllKeyColumnsSelected = createSelector(
    [selectKeyColumns, selectVisibleColumns],
    (keyColumns, visibleColumnsItems) => {
        const visibleColumns = map_(visibleColumnsItems, ({name}) => name);

        return difference_(keyColumns, visibleColumns).length === 0;
    },
);

export const selectIsPaginationDisabled = createSelector(
    [selectIsDynamic, selectIsAllKeyColumnsSelected, selectLoading, selectLoaded],
    (isDynamic, isAllKeyColumnsSelected, loading, loaded) => {
        const initialLoading = loading && !loaded;

        return (isDynamic && !isAllKeyColumnsSelected) || initialLoading;
    },
);

export const selectIsTableEndReached = createSelector(
    [selectRows, selectRequestedPageSize],
    (rows, requestedPageSize) => {
        return rows.length < requestedPageSize;
    },
);

export const selectUpperBoundKey = createSelector(
    [selectRows, selectKeyColumns],
    (rows, keyColumns) => {
        const row = rows[rows.length - 1];

        return getColumnsValues(row, keyColumns);
    },
);

export const selectBottomBoundKey = createSelector(
    [selectRows, selectKeyColumns],
    (rows, keyColumns) => {
        const row = rows[0];

        return getColumnsValues(row, keyColumns);
    },
);

export const selectCurrentOffsetValues = createSelector(
    [selectColumns, selectBottomBoundKey, selectYqlTypes],
    (columns, offsetValues, yqlTypes) => {
        return filter_(columns, (column) => column.keyColumn).map(({name, checked}, index) => {
            return {
                name,
                checked,
                value: offsetValues && Query.prepareColumnValue(offsetValues[index], yqlTypes),
            };
        });
    },
);

export const selectOffsetValue = createSelector(
    [selectOffsetString, selectOffsetMode],
    (offsetString, offsetMode) => {
        return offsetMode === 'row' ? Number(offsetString) : offsetString;
    },
);
export const selectNextOffset = createSelector(
    [selectNextOffsetValue, selectMoveOffsetBackward, selectOffsetMode],
    (offsetValue, moveBackward, offsetMode) => {
        return {
            offsetValue: offsetMode === 'row' ? Number(offsetValue) : offsetValue,
            moveBackward,
        };
    },
);

export const selectIsTableSorted = createSelector([selectAttributes], (attributes) => {
    return ypath.getValue(attributes, '/sorted');
});

export const selectProgressWidth = createSelector(
    [selectOffsetValue, selectRowCount],
    (currentRow, totalRow) => {
        const percent = Math.round((100 * (currentRow + 1)) / totalRow);

        if (currentRow === 0) {
            return '0%';
        }

        return percent < 100 ? `calc(${percent}% + 2px)` : 'calc(100% + 2px)';
    },
);

export const selectIsYqlSchemaExists = createSelector([selectAttributes], (attributes) => {
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

export const selectIsYqlTypesEnabled = createSelector(
    [selectShouldUseYqlTypes],
    (isSettingEnabled) => isSettingEnabled,
);
