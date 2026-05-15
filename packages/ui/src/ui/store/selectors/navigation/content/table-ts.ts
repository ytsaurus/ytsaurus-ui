import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {createSelector} from 'reselect';

import {type RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {CypressNodeTypes} from '../../../../utils/cypress-attributes';
import {selectAttributes} from '../index';
import Columns from '../../../../utils/navigation/content/table/columns';
import {getColumnsValues} from '../../../../utils/navigation/content/table/table';
import {getSettingsData} from '../../../../store/selectors/settings/settings-base';
import {TABLE_DEFAULTS} from '../../../../constants/settings/table';

export const selectLoaded = (state: RootState) => state.navigation.content.table.loaded;
export const selectLoading = (state: RootState) => state.navigation.content.table.loading;

export const selectRows = (state: RootState) => state.navigation.content.table.rows;
export const selectColumns = (state: RootState) => state.navigation.content.table.columns;
export const selectColumnsOrder = (state: RootState) => state.navigation.content.table.columnsOrder;
export const selectYqlTypes = (state: RootState) => state.navigation.content.table.yqlTypes;
export const selectIsDynamic = (state: RootState) => state.navigation.content.table.isDynamic;
export const selectIsStrict = (state: RootState) => state.navigation.content.table.isStrict;
export const selectOffsetMode = (state: RootState) => state.navigation.content.table.offsetMode;
export const selectOffsetString = (state: RootState) => state.navigation.content.table.offsetValue;
export const selectNextOffsetValue = (state: RootState) =>
    state.navigation.content.table.nextOffsetValue;
export const selectMoveOffsetBackward = (state: RootState) =>
    state.navigation.content.table.moveBackward;
export const selectOmittedColumns = (state: RootState) =>
    state.navigation.content.table.omittedColumns;
export const selectDeniedKeyColumns = (state: RootState) =>
    state.navigation.content.table.deniedKeyColumns;

const selectPageSizeRaw = (state: RootState) => state.navigation.content.table.pageSize;
const selectCellSizeRaw = (state: RootState) => state.navigation.content.table.cellSize;

export const selectCellSize = createSelector(
    [selectCellSizeRaw, getSettingsData],
    (cellSize, settings) => {
        return (
            cellSize ??
            settings['global::navigation::maximumTableStringSize'] ??
            TABLE_DEFAULTS.maximumTableStringSize
        );
    },
);

export const selectPageSize = createSelector(
    [selectPageSizeRaw, getSettingsData],
    (pageSize, settings) => {
        return (
            pageSize ??
            settings['global::navigation::rowsPerTablePage'] ??
            TABLE_DEFAULTS.rowsPerTablePage
        );
    },
);

const selectNavigationPathAttributes = (state: RootState) =>
    state.navigation.navigation.attributes as any;

export const selectTableSchema = createSelector(
    [selectNavigationPathAttributes],
    (attributes: any) => {
        const schema = ypath.getValue(attributes, '/schema');

        return schema;
    },
);

export const selectTableColumnNamesFromSchema = createSelector([selectTableSchema], (schema) => {
    return map_(schema, 'name').sort();
});

export const selectNavigationTableLoadingState = createSelector(
    [
        (store: RootState) => store.navigation.content.table.loading,
        (store: RootState) => store.navigation.content.table.loaded,
        (store: RootState) => store.navigation.content.table.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const selectNavigationTableDataLensButtonAlerts = createSelector(
    [selectNavigationPathAttributes],
    (attrs) => {
        const type = ypath.getValue(attrs, '/type');
        if (type !== CypressNodeTypes.TABLE) {
            return {};
        }
        const schema = ypath.getValue(attrs, '/schema');
        const dynamic = ypath.getValue(attrs, '/dynamic');
        const enableDynamicStoreRed = ypath.getValue(attrs, '/enable_dynamic_store_read');
        return {
            isEmptySchema: !schema.length,
            enableDynamicStoreRedRequired: dynamic ? !enableDynamicStoreRed : false,
        };
    },
);

export const selectKeyColumns = createSelector(selectAttributes, (attributes) =>
    Columns.getKeyColumns(attributes),
);

export const selectCurrentRowKey = createSelector(
    [selectRows, selectKeyColumns, (_state: RootState, index: number) => index],
    (rows, keyColumns, index) => {
        const row = rows[index];

        return getColumnsValues(row, keyColumns) as [Array<string>, string];
    },
);

export const selectColumnsPresetHash = (state: RootState) =>
    state.navigation.content.table.columnsPresetHash;
export const selectColumnsPreset = (state: RootState) =>
    state.navigation.content.table.columnsPreset;
export const selectColumnsPresetColumns = (state: RootState): Array<string> | undefined =>
    state.navigation.content.table.columnsPreset.columns;
export const selectColumnsPresetError = (state: RootState): Array<string> | undefined =>
    state.navigation.content.table.columnsPreset.error;
