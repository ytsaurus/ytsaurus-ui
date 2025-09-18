import React from 'react';
import {Action} from 'redux';

import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';
import toLower_ from 'lodash/toLower';

import {ThunkAction} from 'redux-thunk';
import axios, {CancelTokenSource} from 'axios';

import {getBatchError} from '../../../../../shared/utils/error';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import ypath from '../../../../common/thor/ypath';
import {
    USE_SKIP_ERROR_FN_NODE_DOES_NOT_EXIST,
    wrapApiPromiseByToaster,
} from '../../../../utils/utils';
import {loadPoolTreesIfNotLoaded} from '../../../../store/actions/global';
import {RootState} from '../../../../store/reducers';

import {OperationShortInfo} from '../../../../pages/components/OperationShortInfo/OperationShortInfo';
import {AppStoreProvider} from '../../../../containers/App/AppStoreProvider';
import {CypressNodeTypes, makeUiMarker} from '../../../../utils/cypress-attributes';
import {Page} from '../../../../constants';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {
    PathAttribute,
    changeAttribute,
    setModalPartial,
} from '../../../reducers/navigation/modals/tableMergeSortModalSlice';
import {getNavigationTableOutputPathAttributes} from '../../../selectors/navigation/modals/table-merge-sort-modal';

type TableMergeSortThunkAction<T = void> = ThunkAction<T, RootState, any, Action>;

export function showTableSortModal(paths: Array<string>): TableMergeSortThunkAction<Promise<void>> {
    return (dispatch) => {
        return dispatch(loadPoolTreesIfNotLoaded()).finally(() => {
            dispatch(setModalPartial({sortVisible: true, paths}));
            dispatch(tableSortModalLoadColumns(paths));
        });
    };
}

export function hideTableSortModal() {
    return setModalPartial({sortVisible: false, paths: []});
}

export function showTableMergeModal(
    paths: Array<string>,
): ThunkAction<Promise<void>, RootState, any, Action> {
    return (dispatch) => {
        return dispatch(loadPoolTreesIfNotLoaded()).finally(() => {
            dispatch(
                setModalPartial({
                    mergeVisible: true,
                    paths,
                }),
            );
            dispatch(tableSortModalLoadColumns(paths));
        });
    };
}

export function hideTableMergeModal() {
    return setModalPartial({mergeVisible: false, paths: []});
}

export function tableSortModalLoadColumns(
    paths: Array<string>,
): ThunkAction<any, RootState, any, Action> {
    return (dispatch) => {
        if (!paths?.length) {
            return undefined;
        }
        const requests = map_(paths, (path) => {
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
                    dispatch(setModalPartial({error}));
                    return;
                }
                const columns: {[name: string]: boolean} = {};
                forEach_(results, ({output}) => {
                    forEach_(ypath.getValue(output), ({name}) => {
                        columns[name] = true;
                    });
                });
                dispatch(
                    setModalPartial({
                        suggestColumns: sortBy_(
                            map_(columns, (_v, name) => name),
                            (name) => toLower_(name),
                        ),
                    }),
                );
            })
            .catch((error: any) => {
                return dispatch(
                    setModalPartial({
                        error,
                    }),
                );
            });
    };
}

interface SortParams {
    input_table_paths: Array<string>;
    output_table_path: {$value: string; $attributes: Record<string, string>};
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

export const loadStorageAttributes =
    (path: string): TableMergeSortThunkAction =>
    async (dispatch, getState) => {
        const state = getState();
        const outputPathAttributes = getNavigationTableOutputPathAttributes(state);

        const response: Record<PathAttribute, string> = await wrapApiPromiseByToaster(
            ytApiV3Id.get(YTApiId.attributesEditorGetAttrs, {
                parameters: {
                    path: path + '/@',
                    attributes: [
                        PathAttribute.OPTIMIZE_FOR,
                        PathAttribute.COMPRESSION_CODEC,
                        PathAttribute.ERASURE_CODEC,
                    ],
                },
            }),
            {
                toasterName: 'get_table_attributes',
                errorTitle: 'Get table attributes request is failed',
                autoHide: false,
                skipSuccessToast: true,
                ...USE_SKIP_ERROR_FN_NODE_DOES_NOT_EXIST,
            },
        );

        Object.entries(outputPathAttributes).forEach(([key, attribute]) => {
            dispatch(changeAttribute({...attribute, value: response[key as PathAttribute]}));
        });
    };

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
    if (!path) return;

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
