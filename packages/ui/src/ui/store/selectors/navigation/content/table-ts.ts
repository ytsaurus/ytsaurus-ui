import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {createSelector} from 'reselect';

import type {RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';
import {CypressNodeTypes} from '../../../../utils/cypress-attributes';

export const getLoaded = (state: RootState) => state.navigation.content.table.loaded;
export const getLoading = (state: RootState) => state.navigation.content.table.loading;

export const getRows = (state: RootState) => state.navigation.content.table.rows;
export const getColumns = (state: RootState) => state.navigation.content.table.columns;
export const getColumnsOrder = (state: RootState) => state.navigation.content.table.columnsOrder;
export const getYqlTypes = (state: RootState) => state.navigation.content.table.yqlTypes;
export const getIsDynamic = (state: RootState) => state.navigation.content.table.isDynamic;
export const getIsStrict = (state: RootState) => state.navigation.content.table.isStrict;
export const getOffsetMode = (state: RootState) => state.navigation.content.table.offsetMode;
export const getOffsetString = (state: RootState) => state.navigation.content.table.offsetValue;
export const getNextOffsetValue = (state: RootState) =>
    state.navigation.content.table.nextOffsetValue;
export const getMoveOffsetBackward = (state: RootState) =>
    state.navigation.content.table.moveBackward;
export const getOmittedColumns = (state: RootState) =>
    state.navigation.content.table.omittedColumns;
export const getDeniedKeyColumns = (state: RootState) =>
    state.navigation.content.table.deniedKeyColumns;

export const getPageSize = (state: RootState) => state.navigation.content.table.pageSize;
export const getCellSize = (state: RootState) => state.navigation.content.table.cellSize;

const getNavigationPathAttributes = (state: RootState) =>
    state.navigation.navigation.attributes as any;

export const getTableSchema = createSelector([getNavigationPathAttributes], (attributes: any) => {
    const schema = ypath.getValue(attributes, '/schema');

    return schema;
});

export const getTableColumnNamesFromSchema = createSelector([getTableSchema], (schema) => {
    return map_(schema, 'name').sort();
});

export const getNavigationTableLoadingState = createSelector(
    [
        (store: RootState) => store.navigation.content.table.loading,
        (store: RootState) => store.navigation.content.table.loaded,
        (store: RootState) => store.navigation.content.table.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const getNavigationTableDataLensButtonAlerts = createSelector(
    [getNavigationPathAttributes],
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

export const getColumnsPresetHash = (state: RootState) =>
    state.navigation.content.table.columnsPresetHash;
export const getColumnsPreset = (state: RootState) => state.navigation.content.table.columnsPreset;
export const getColumnsPresetColumns = (state: RootState): Array<string> | undefined =>
    state.navigation.content.table.columnsPreset.columns;
export const getColumnsPresetError = (state: RootState): Array<string> | undefined =>
    state.navigation.content.table.columnsPreset.error;
