import React from 'react';
import _ from 'lodash';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import axios, {CancelTokenSource} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import ypath from '../../../../common/thor/ypath';
import {TABLE_SORT_MODAL_PARTIAL} from '../../../../constants/navigation/modals/table-sort-modal';
import {getBatchError, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {TableSortModalAction} from '../../../../store/reducers/navigation/modals/table-merge-sort-modal';
import {OperationShortInfo} from '../../../../pages/components/OperationShortInfo/OperationShortInfo';
import {AppStoreProvider} from '../../../../containers/App/AppStoreProvider';
import {CypressNodeTypes, makeUiMarker} from '../../../../utils/cypress-attributes';
import {Page} from '../../../../constants';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type TableMergeSortThunkAction = ThunkAction<any, RootState, any, TableSortModalAction>;

export function showTableSortModal(paths: Array<string>): TableMergeSortThunkAction {
    return (dispatch) => {
        dispatch({
            type: TABLE_SORT_MODAL_PARTIAL,
            data: {sortVisible: true, paths},
        });
        dispatch(tableSortModalLoadColumns(paths));
    };
}

export function hideTableSortModal(): TableSortModalAction {
    return {
        type: TABLE_SORT_MODAL_PARTIAL,
        data: {sortVisible: false, paths: []},
    };
}

export function showTableMergeModal(
    paths: Array<string>,
): ThunkAction<any, RootState, any, TableSortModalAction> {
    return (dispatch) => {
        dispatch({
            type: TABLE_SORT_MODAL_PARTIAL,
            data: {mergeVisible: true, paths},
        });
        dispatch(tableSortModalLoadColumns(paths));
    };
}

export function hideTableMergeModal(): TableSortModalAction {
    return {
        type: TABLE_SORT_MODAL_PARTIAL,
        data: {mergeVisible: false, paths: []},
    };
}

export function tableSortModalLoadColumns(
    paths: Array<string>,
): ThunkAction<any, RootState, any, TableSortModalAction> {
    return (dispatch) => {
        if (!paths?.length) {
            return undefined;
        }
        const requests = _.map(paths, (path) => {
            return {
                command: 'get' as const,
                parameters: {path: `${path}/@schema`},
            };
        });
        return ytApiV3Id
            .executeBatch(YTApiId.navigationTableSortLoadColumns, {requests})
            .then((results: Array<any>) => {
                const error = getBatchError(
                    results,
                    'Column names cannot be loaded, autocompletion might not work properly',
                );
                if (error) {
                    dispatch({
                        type: TABLE_SORT_MODAL_PARTIAL,
                        data: {error},
                    });
                    return;
                }
                const columns: {[name: string]: boolean} = {};
                _.forEach(results, ({output}) => {
                    _.forEach(ypath.getValue(output), ({name}) => {
                        columns[name] = true;
                    });
                });
                dispatch({
                    type: TABLE_SORT_MODAL_PARTIAL,
                    data: {
                        suggestColumns: _.sortBy(
                            _.map(columns, (_v, name) => name),
                            (name) => _.toLower(name),
                        ),
                    },
                });
            })
            .catch((error: any) => {
                return dispatch({
                    type: TABLE_SORT_MODAL_PARTIAL,
                    data: {error},
                });
            });
    };
}

interface SortParams {
    input_table_paths: Array<string>;
    output_table_path: string;
    sort_by: Array<{name: string; sort_order: 'ascending' | 'descending'}>;
    pool?: string;
}

export function runTableSort(spec: SortParams): TableMergeSortThunkAction {
    return () => {
        const parameters = {
            spec,
            ...makeUiMarker(`${Page.NAVIGATION}:sort`),
        };
        return wrapApiPromiseByToaster(yt.v3.sort(parameters), {
            toasterName: 'table_sort_' + spec.output_table_path,
            successContent(res: string) {
                const opId = JSON.parse(res);
                return (
                    <AppStoreProvider>
                        <OperationShortInfo
                            id={opId}
                            type={'sort'}
                            output_attribute_name={'/spec/output_table_path'}
                        />
                    </AppStoreProvider>
                );
            },
            successTitle: 'Sort operation is started',
            errorTitle: 'Sort operation is failed',
            autoHide: false,
        });
    };
}

interface MergeParams {
    pool: string;
    pool_trees: Array<string>;
    input_table_paths: Array<string>;
    output_table_path: string;
    merge_by: Array<string>;
    mode: 'unordered' | 'sorted' | 'ordered';
}

export function runTableMerge(spec: MergeParams): TableMergeSortThunkAction {
    return () => {
        const parameters = {
            spec,
            ...makeUiMarker(`${Page.NAVIGATION}:merge`),
        };
        return wrapApiPromiseByToaster(yt.v3.merge(parameters), {
            toasterName: 'table_merge_' + spec.output_table_path,
            successContent(res: string) {
                const opId = JSON.parse(res);
                return (
                    <AppStoreProvider>
                        <OperationShortInfo
                            id={opId}
                            type={'merge'}
                            output_attribute_name={'/spec/output_table_path'}
                        />
                    </AppStoreProvider>
                );
            },
            successTitle: 'Merge operation is started',
            errorTitle: 'Merge operation is failed',
            autoHide: false,
        });
    };
}

let cancelTokenSrc: Pick<CancelTokenSource, 'cancel'> = {cancel: () => {}};

export function isPathStaticTable(path: string) {
    cancelTokenSrc.cancel();
    return ytApiV3Id
        .get(
            YTApiId.navigationIsStaticTable,
            {
                path,
                attributes: ['type', 'dynamic'],
            },
            (cancelSrc: CancelTokenSource) => {
                cancelTokenSrc = cancelSrc;
            },
        )
        .then((d: any) => {
            const type = ypath.getValue(d, '/@type');
            const isDynamic = ypath.getValue(d, '/@dynamic');
            return type !== CypressNodeTypes.TABLE || isDynamic
                ? 'Please make sure the destination is an existing static table'
                : undefined;
        })
        .catch((e: any) => {
            if (axios.isCancel(e)) {
                return undefined;
            }
            return e?.message || 'Cannot get type of node';
        });
}
