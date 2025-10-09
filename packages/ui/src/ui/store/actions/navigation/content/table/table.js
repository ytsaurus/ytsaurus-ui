import filter_ from 'lodash/filter';
import has_ from 'lodash/has';
import isEmpty_ from 'lodash/isEmpty';
import keyBy_ from 'lodash/keyBy';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {getMetrics} from '../../../../../common/utils/metrics';
import ypath from '../../../../../common/thor/ypath';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {
    CHANGE_CELL_SIZE,
    CHANGE_PAGE_SIZE,
    CLOSE_COLUMN_SELECTOR_MODAL,
    GET_TABLE_DATA,
    LOAD_TYPE,
    OPEN_COLUMN_SELECTOR_MODAL,
    SET_COLUMNS,
    SET_COLUMNS_ORDER,
    SET_OFFSET,
    TOGGLE_FULL_SCREEN,
} from '../../../../../constants/navigation/content/table';

import {updateView} from '../../../../../store/actions/navigation';

import CancelHelper from '../../../../../utils/cancel-helper';
import {openInNewTab, showErrorPopup} from '../../../../../utils/utils';
import {prepareRequest} from '../../../../../utils/navigation';
import Query from '../../../../../utils/navigation/content/table/query';
import Columns from '../../../../../utils/navigation/content/table/columns';
import {getCluster} from '../../../../../store/selectors/global';
import {
    getColumnsValues,
    getRequestOutputFormat,
} from '../../../../../utils/navigation/content/table/table';

import {getAttributes, getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {
    getDefaultTableColumnLimit,
    isTableSimilarityEnabled,
} from '../../../../../store/selectors/settings';
import {
    getAllColumns,
    getNextOffset,
    getRequestedPageSize,
    getVisibleColumns,
    isYqlTypesEnabled,
} from '../../../../../store/selectors/navigation/content/table';
import {
    getCellSize,
    getColumns,
    getColumnsPreset,
    getDeniedKeyColumns,
    getIsDynamic,
    getIsStrict,
    getKeyColumns,
    getMoveOffsetBackward,
    getOmittedColumns,
    getRows,
    getTableColumnNamesFromSchema,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {mergeScreen} from '../../../../../store/actions/global';
import {waitForFontFamilies} from '../../../../../store/actions/global/fonts';
import {injectColumnsFromSchema} from '../../../../../utils/navigation/content/table/table-ts';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import unipika from '../../../../../common/thor/unipika';
import {toaster} from '../../../../../utils/toaster';

import {loadColumnPresetIfDefined, saveColumnPreset, setTablePresetHash} from './columns-preset';
import {makeTableRumId} from './table-rum-id';
import {readStaticTable} from './readStaticTable';
import {readDynamicTable} from './readDynamicTable';

const requests = new CancelHelper();

function loadDynamicTable(requestOutputFormat, state, type, useZeroRangeForPreload) {
    const {login} = state.global;

    const path = getPath(state);
    const stringLimit = getCellSize(state);
    const keyColumns = getKeyColumns(state);
    const columns = getColumns(state);
    const attributes = getAttributes(state);
    const useYqlTypes = isYqlTypesEnabled(state);
    const moveBackward = getMoveOffsetBackward(state);
    const defaultTableColumnLimit = getDefaultTableColumnLimit(state);
    const {offsetValue: offset, moveBackward: descending} = getNextOffset(state);
    const transaction = getTransaction(state);
    const orderBySupported = true;
    const offsetColumns = keyColumns;

    let limit = getRequestedPageSize(state);
    if (isEmpty_(offset) && descending) {
        // If we move to the end of the table, we reduce the limit for correctly determining the end of the table
        limit--;
    }

    const decodedColumns = decodeNameField(columns);
    const outputFormat =
        requestOutputFormat ||
        getRequestOutputFormat(
            decodedColumns,
            stringLimit,
            login,
            defaultTableColumnLimit,
            useYqlTypes,
        );

    const cluster = getCluster(state);
    const isDynamic = getIsDynamic(state);
    const isSorted = ypath.getValue(attributes, '/sorted');
    const id = makeTableRumId({cluster, isDynamic});

    const isUnmounted = ypath.getValue(attributes, '/tablet_state') === 'unmounted';

    if (isUnmounted && !isSorted) {
        // in case of unmounted dynamic table treat it as a static table
        const apiId = type === LOAD_TYPE.PRELOAD ? YTApiId.tableReadPreload : YTApiId.tableRead;
        // example: offset = "(1, 2)": string , we need [1, 2]: number[]
        const preparedOffset = offset
            .replace(/[()]/g, '')
            .split(',')
            .map((part) => Number(part.trim()));

        return id.fetch(
            apiId,
            readStaticTable({
                parameters: {
                    path: {
                        $value: path,
                        $attributes: {
                            ranges: [
                                {
                                    lower_limit: {
                                        tablet_index: preparedOffset[0] || 0,
                                        row_index: preparedOffset[1] || 0,
                                    },
                                    upper_limit: {
                                        tablet_index: preparedOffset[0] || 0,
                                        row_index: limit + (preparedOffset[1] || 0),
                                    },
                                },
                            ],
                        },
                    },
                    table_reader: {
                        workload_descriptor: {category: 'user_interactive'},
                    },
                    transaction,
                    output_format: outputFormat,
                },
                cancellation: requests.saveCancelToken,
                reverseRows: moveBackward,
            }),
        );
    }

    if (type === LOAD_TYPE.PRELOAD) {
        // Get all columns from schema for preload data. Scheme is always strict
        const allColumns = Columns.getSchemaColumns(attributes);

        return id
            .fetch(
                YTApiId.dynTableCheckPerm,
                ytApiV3Id.checkPermission(YTApiId.dynTableCheckPerm, {
                    parameters: {
                        columns: allColumns,
                        permission: 'read',
                        user: login,
                        path,
                    },
                    cancellation: requests.saveCancelToken,
                }),
            )
            .then((permissions) => {
                const keyColumnsNames = keyBy_(keyColumns);
                const {availableColumns, omittedColumns, deniedKeyColumns} = reduce_(
                    permissions.columns,
                    (res, permission, index) => {
                        if (permission.action === 'allow') {
                            res.availableColumns.push(allColumns[index]);
                        } else {
                            res.omittedColumns.push(allColumns[index]);
                            if (has_(keyColumnsNames, allColumns[index])) {
                                res.deniedKeyColumns.push({[allColumns[index]]: permission.action});
                            }
                        }

                        return res;
                    },
                    {availableColumns: [], omittedColumns: [], deniedKeyColumns: []},
                );

                if (deniedKeyColumns.length !== 0) {
                    return Promise.reject({deniedKeyColumns});
                }

                const columns = map_(availableColumns, unipika.decode);
                const parameters = {
                    query: Query.prepareQuery({
                        columns,
                        path,
                        keyColumns,
                        offsetColumns,
                        offset: useZeroRangeForPreload ? 0 : offset,
                        limit: useZeroRangeForPreload ? 0 : limit,
                        descending,
                        orderBySupported,
                    }),
                    output_format: requestOutputFormat,
                    dump_error_into_response: true,
                };

                return id
                    .fetch(
                        YTApiId.dynTableSelectRowsPreload,
                        readDynamicTable({
                            parameters,
                            cancellation: requests.saveCancelToken,
                        }),
                    )
                    .then((data) => {
                        return {
                            ...data,
                            omittedColumns,
                        };
                    });
            });
    } else {
        // Get only visible columns for updating data. Get omittedColumns from store.
        const columns = getVisibleColumns(state);
        const omittedColumns = getOmittedColumns(state);
        const deniedKeyColumns = getDeniedKeyColumns(state);
        const decodedColumns = decodeNameField(columns);
        const outputFormat = getRequestOutputFormat(
            decodedColumns,
            stringLimit,
            login,
            defaultTableColumnLimit,
            useYqlTypes,
        );

        if (deniedKeyColumns.length !== 0) {
            const err = new Error('There is no "read" permission for some key columns:');
            err.attributes = {key_columns: deniedKeyColumns};
            return Promise.reject(err);
        }

        const parameters = {
            query: Query.prepareQuery({
                columns: decodedColumns,
                path,
                keyColumns,
                offsetColumns,
                offset,
                limit,
                descending,
                orderBySupported,
            }),
            output_format: outputFormat,
            dump_error_into_response: true,
        };

        return id
            .fetch(
                YTApiId.dynTableSelectRows,
                readDynamicTable({
                    parameters,
                    cancellation: requests.saveCancelToken,
                }),
            )
            .then((data) => {
                return {
                    ...data,
                    omittedColumns,
                };
            });
    }
}

async function loadStaticTable(requestOutputFormat, state, type, useZeroRangeForPreload) {
    const path = getPath(state);
    const stringLimit = getCellSize(state);
    const transaction = getTransaction(state);
    const moveBackward = getMoveOffsetBackward(state);
    const requestedPageSize = getRequestedPageSize(state);
    const defaultTableColumnLimit = getDefaultTableColumnLimit(state);

    const {login} = state.global;
    // Get all columns always and update them then. We can get new columns. The scheme is not always strict
    const columns = getColumns(state);
    const offsetValue = getNextOffset(state).offsetValue;
    const useYqlTypes = isYqlTypesEnabled(state);
    const decodedColumns = decodeNameField(columns);
    const outputFormat =
        requestOutputFormat ||
        getRequestOutputFormat(
            decodedColumns,
            stringLimit,
            login,
            defaultTableColumnLimit,
            useYqlTypes,
        );

    const parameters = prepareRequest({
        path,
        table_reader: {
            workload_descriptor: {category: 'user_interactive'},
        },
        transaction,
        output_format: outputFormat,
        relativePath: useZeroRangeForPreload
            ? '[#0:#0]'
            : '[#' + offsetValue + ':#' + (offsetValue + requestedPageSize) + ']',
    });

    const cluster = getCluster(state);
    const isDynamic = getIsDynamic(state);
    const id = makeTableRumId({cluster, isDynamic});
    const apiId = type === LOAD_TYPE.PRELOAD ? YTApiId.tableReadPreload : YTApiId.tableRead;

    return await id.fetch(
        apiId,
        readStaticTable({
            parameters,
            cancellation: requests.saveCancelToken,
            reverseRows: moveBackward,
        }),
    );
}

function loadTableRows(type, state, requestOutputFormat) {
    const isDynamic = getIsDynamic(state);
    const isStrict = getIsStrict(state);
    const useZeroRangeForPreload = isStrict && type === LOAD_TYPE.PRELOAD;

    const loadPromise = isDynamic
        ? loadDynamicTable(requestOutputFormat, state, type, useZeroRangeForPreload)
        : loadStaticTable(requestOutputFormat, state, type, useZeroRangeForPreload);

    return loadPromise.then((result) => {
        const schemaColumns = getTableColumnNamesFromSchema(state);
        const {columns, omittedColumns, ...rest} = result;
        return {
            columns: injectColumnsFromSchema(columns, omittedColumns, schemaColumns),
            omittedColumns,
            ...rest,
        };
    });
}

// Make a table request with page size row range and empty column range to get the list of all columns in table
// and restore personalized columns list.
function restoreColumns(state) {
    const tableSimilarityEnabled = isTableSimilarityEnabled(state);
    const attributes = getAttributes(state);
    const stringLimit = getCellSize(state);

    const requestOutputFormat = {
        $value: 'web_json',
        $attributes: {
            field_weight_limit: stringLimit,
            max_selected_column_count: 50,
            max_all_column_names_count: 3000,
            column_names: [],
        },
    };

    return loadTableRows(LOAD_TYPE.PRELOAD, state, requestOutputFormat)
        .then(({columns, omittedColumns}) => {
            const storedColumns = tableSimilarityEnabled
                ? Columns.restoreSimilarColumns(attributes, columns)
                : Columns.restoreExactColumns(attributes);

            return {columns, omittedColumns, storedColumns};
        })
        .catch((data) => {
            const {deniedKeyColumns} = data;
            return {
                columns: [],
                omittedColumns: [],
                storedColumns: null,
                ...(deniedKeyColumns ? {deniedKeyColumns} : {}),
            };
        });
}

export function updateTableData() {
    return (dispatch, getState) => {
        const state = getState();
        const attributes = getAttributes(state);
        const {offsetValue, moveBackward} = getNextOffset(state);
        const requestedPageSize = getRequestedPageSize(state);
        const isDynamic = getIsDynamic(state);

        dispatch({type: GET_TABLE_DATA.REQUEST});
        requests.removeAllRequests();

        return loadTableRows(LOAD_TYPE.UPDATE, state)
            .then(({columns, omittedColumns, rows, yqlTypes}) => {
                // Scheme is always strict in dynamic tables. No new columns are expected.
                if (!isDynamic) {
                    // Get current columns for save visible status
                    const storedColumns = getColumns(state);
                    const defaultTableColumnLimit = getDefaultTableColumnLimit(state);
                    const preparedColumns = Columns.prepareColumns(
                        attributes,
                        rows,
                        columns,
                        storedColumns,
                        defaultTableColumnLimit,
                    );
                    const preparedOmittedColumns = Columns.prepareOmittedColumns(
                        attributes,
                        omittedColumns,
                    );
                    dispatch(setColumns(preparedColumns, preparedOmittedColumns, []));
                }

                if (moveBackward) {
                    let newOffsetValue;
                    if (!isEmpty_(offsetValue) && rows.length < requestedPageSize) {
                        // If there are not enough rows on the new page on the left:
                        //  - add rows from the current page
                        //  - reset offset value
                        newOffsetValue = '';
                        const previousRows = getRows(state);
                        const addRowCount = Math.min(
                            requestedPageSize - rows.length + 1,
                            previousRows.length,
                        );
                        rows = rows.concat(previousRows.slice(1, addRowCount));
                    } else {
                        const keyColumns = getKeyColumns(state);
                        newOffsetValue = Query.prepareKey(getColumnsValues(rows[0], keyColumns));
                    }

                    if (newOffsetValue !== undefined) {
                        dispatch({
                            type: SET_OFFSET,
                            data: {offsetValue: newOffsetValue},
                        });
                    }
                }

                dispatch({
                    type: GET_TABLE_DATA.SUCCESS,
                    data: {rows, yqlTypes},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_TABLE_DATA.CANCELLED});
                } else {
                    dispatch({
                        type: GET_TABLE_DATA.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function getTableData() {
    return (dispatch, getState) => {
        const state = getState();

        const attributes = getAttributes(state);

        return dispatch(loadColumnPresetIfDefined()).then(() => {
            const updateColumns = ({
                rows,
                columns,
                omittedColumns,
                storedColumns,
                deniedKeyColumns = [],
            }) => {
                const state = getState();
                const defaultTableColumnLimit = getDefaultTableColumnLimit(state);
                const preparedColumns = Columns.prepareColumns(
                    attributes,
                    rows,
                    columns,
                    storedColumns,
                    defaultTableColumnLimit,
                );
                const preparedOmittedColumns = Columns.prepareOmittedColumns(
                    attributes,
                    omittedColumns,
                );

                // if we have columns preset -> update checked according to preset
                const preset = getColumnsPreset(state);
                if (preset?.columns) {
                    preparedColumns.forEach((column) => {
                        column.checked = preset?.columns?.includes(column.name);
                    });
                }
                dispatch(setColumns(preparedColumns, preparedOmittedColumns, deniedKeyColumns));
            };

            dispatch({type: GET_TABLE_DATA.REQUEST});
            requests.removeAllRequests();

            // 1. call the restoreColumns function before loading table data
            // 2. Call loadTableRows function with specific requestOutputFormat and empty column_names to get all columns and return their and stored columns:
            //   a) tableSimilarityEnabled === false. Finding stored columns by id and schema. If stored columns exists -- update their and return. Else return null
            //   b) tableSimilarityEnabled === true. Finding stored columns by array of all columns. If stored columns exists -- update their and return. Else return null
            // 3. If at the previous step was returned an array then building columns based on stored columns and save their in the store.
            // 4. load table rows for columns in the store

            return dispatch(waitForFontFamilies(restoreColumns(getState())))
                .then(({columns, omittedColumns, storedColumns, ...rest}) => {
                    if (columns) {
                        updateColumns({
                            rows: [],
                            columns,
                            omittedColumns,
                            storedColumns,
                            ...rest,
                        });
                    }
                    return dispatch(updateTableData());
                })
                .catch((error) => {
                    updateColumns({
                        rows: [],
                        columns: Columns.getSchemaColumns(attributes),
                        omittedColumns: [],
                    });

                    if (error.code === yt.codes.CANCELLED) {
                        dispatch({type: GET_TABLE_DATA.CANCELLED});
                    } else {
                        dispatch({
                            type: GET_TABLE_DATA.FAILURE,
                            data: {error},
                        });
                    }
                });
        });
    };
}

export function setColumns(columns, omittedColumns, deniedKeyColumns) {
    return {
        type: SET_COLUMNS,
        data: {columns, omittedColumns, deniedKeyColumns},
    };
}

export function setColumnsOrder(columnsOrder) {
    return {
        type: SET_COLUMNS_ORDER,
        data: {columnsOrder},
    };
}

export function openColumnSelectorModal() {
    return {
        type: OPEN_COLUMN_SELECTOR_MODAL,
    };
}

export function closeColumnSelectorModal() {
    return {
        type: CLOSE_COLUMN_SELECTOR_MODAL,
    };
}

export function updateColumns(allColumns) {
    return (dispatch, getState) => {
        const state = getState();
        const attributes = getAttributes(state);
        const omittedColumns = getOmittedColumns(state);
        const deniedKeyColumns = getDeniedKeyColumns(state);
        const columns = filter_(allColumns, (column) => !column.disabled); // remove omitted columns
        const columnsOrder = Columns.getColumnsOrder(columns);
        Columns.storeAllColumns(attributes, columns);

        dispatch(setColumns(columns, omittedColumns, deniedKeyColumns));
        dispatch(setColumnsOrder(columnsOrder));
        dispatch(closeColumnSelectorModal());

        dispatch(setTablePresetHash(undefined));
        dispatch(updateTableData());
    };
}

export function rememberPresetColumnsAsDefault() {
    return (dispatch, getState) => {
        const allColumns = getAllColumns(getState());
        dispatch(updateColumns(allColumns));
    };
}

export function openTableWithPresetOfColumns() {
    return (dispatch, getState) => {
        const visibleColumns = getVisibleColumns(getState());
        const cluster = getCluster(getState());
        saveColumnPreset(map_(visibleColumns, 'name'), cluster).then((hash) => {
            const {href} = window.location;
            const url = `${href}&columns=${hash}`;
            openInNewTab(url);

            getMetrics().countEvent('share_columns', hash);
        });
    };
}

export function changePageSize(pageSize) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_PAGE_SIZE,
            data: {pageSize},
        });
        dispatch(updateTableData());
    };
}

export function changeCellSize(cellSize) {
    return (dispatch) => {
        dispatch({
            type: CHANGE_CELL_SIZE,
            data: {cellSize},
        });
        dispatch(updateTableData());
    };
}

export function toggleFullScreen() {
    return (dispatch) => {
        dispatch(mergeScreen());
        dispatch({type: TOGGLE_FULL_SCREEN});
    };
}

// if we press esc button then the browser will automatically change state to non full screen
// and we need as change value in the store
export function handleScreenChanged(isFullScreen) {
    return (dispatch, getState) => {
        const {isFullScreen: storedIsFullScreen} = getState().navigation.content.table;

        if (isFullScreen !== storedIsFullScreen) {
            dispatch(toggleFullScreen());
        }
    };
}

export function mountUnmountTable(action) {
    return (dispatch, getState) => {
        const path = getPath(getState());

        getMetrics().countEvent('navigation_dynamic_table_action', action);

        return ytApiV3[`${action}Table`]({path})
            .then(() => {
                toaster.add({
                    name: `${action} table`,
                    theme: 'success',
                    title: `Success ${action}ing table`,
                });
                return dispatch(updateView());
            })
            .catch((err) => {
                console.error(err);
                toaster.add({
                    name: `${action} table`,
                    theme: 'danger',
                    title: `Could not ${action} table.`,
                    content: err?.message || 'Oops, something went wrong',
                    actions: [{label: ' view', onClick: () => showErrorPopup(err)}],
                });
            });
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_TABLE_DATA.CANCELLED});
    };
}

export function decodeNameField(columns) {
    return map_(columns, (item) => {
        return {
            ...item,
            name: unipika.decode(item.name),
        };
    });
}
