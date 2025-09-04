import React from 'react';

import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import join_ from 'lodash/join';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {ThunkAction} from 'redux-thunk';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getBatchError} from '../../../../../shared/utils/error';
import ypath from '../../../../common/thor/ypath';

import {
    NAVIGATION_ATTRIBUTES_EDITOR_ERROR,
    NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
    NAVIGATION_ATTRIBUTES_EDITOR_REQUEST,
    NAVIGATION_ATTRIBUTES_EDITOR_SUCCESS,
} from '../../../../constants/navigation/modals/attributes-editor';
import {RootState} from '../../../../store/reducers';
import {NavAttrEditorAction} from '../../../../store/reducers/navigation/modals/attributes-editor';
import {
    getNavigationAttributesEditorAttributes,
    getNavigationAttributesEditorPath,
    getNavigationAttributesEditorStaticTables,
} from '../../../../store/selectors/navigation/modals/attributes-editor';
import {showErrorPopup, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {OperationShortInfo} from '../../../../pages/components/OperationShortInfo/OperationShortInfo';
import {AppStoreProvider} from '../../../../containers/App/AppStoreProvider';
import {updateView} from '../index';
import Link from '../../../../components/Link/Link';
import {getCluster} from '../../../selectors/global';
import {makeUiMarker, prepareSetCommandForBatch} from '../../../../utils/cypress-attributes';
import {Page} from '../../../../constants';
import {executeBatchWithRetries} from '../../execute-batch';
import {YTApiId} from '../../../../rum/rum-wrap-api';
import {BatchSubRequest} from '../../../../../shared/yt-types';
import {toaster} from '../../../../utils/toaster';

type ActionType<R = any> = ThunkAction<R, RootState, any, NavAttrEditorAction>;

const EDITABLE_ATTRIBUTES = [
    'type',
    'account',
    'primary_medium',
    'optimize_for',
    'compression_codec',
    'erasure_codec',
    'replication_factor',
    'tablet_cell_bundle',
    'in_memory_mode',
    'dynamic',
    'sorted',
    'annotation',
    'annotation_path',
    'expiration_time',
    'expiration_timeout',
];

export function showNavigationAttributesEditor(paths: Array<string>): ActionType {
    return (dispatch) => {
        dispatch({type: NAVIGATION_ATTRIBUTES_EDITOR_REQUEST});
        const requests = map_(paths, (path) => {
            return {
                command: 'get' as const,
                parameters: {
                    path: path + '/@',
                    attributes: EDITABLE_ATTRIBUTES,
                },
            };
        });
        return executeBatchWithRetries(YTApiId.attributesEditorGetAttrs, requests, {
            errorTitle: 'Attributes cannot be loaded',
        })
            .then((results: any) => {
                const error = getBatchError(results, 'Attributes cannot be loaded');
                if (error) {
                    throw error;
                }
                const attributesMap = reduce_(
                    paths,
                    (acc, path, index) => {
                        acc[path] = {$attributes: results[index].output};
                        return acc;
                    },
                    {} as any,
                );
                dispatch({
                    type: NAVIGATION_ATTRIBUTES_EDITOR_SUCCESS,
                    data: {attributesMap, paths},
                });
                dispatch({
                    type: NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
                    data: {visible: true},
                });
            })
            .catch((e: any) => {
                dispatch({type: NAVIGATION_ATTRIBUTES_EDITOR_ERROR, data: e});
                toaster.add({
                    name: 'show_attrs_editor_' + join_(paths),
                    theme: 'danger',
                    title: 'Attributes cannot be loaded',
                    content: e?.message,
                    actions: [
                        {
                            label: ' [Details]',
                            onClick: () => showErrorPopup(e),
                        },
                    ],
                    autoHiding: false,
                });
            });
    };
}

export function hideNavigationAttributesEditor() {
    return {
        type: NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
        data: {paths: undefined, visible: false},
    };
}

const EDIT_MARKER = makeUiMarker(`${Page.NAVIGATION}:edit-attributes`);
const EDIT_MERGE_MARKER = makeUiMarker(`${Page.NAVIGATION}:edit-attributes:merge`);

export function navigationSetNodeAttributes(
    generalAttrs: any,
    storageAttrs: object,
    runMerge: boolean,
): ActionType<Promise<unknown>> {
    return (dispatch, getState) => {
        const paths = getNavigationAttributesEditorPath(getState());

        if (isEmpty_({...generalAttrs, ...storageAttrs})) {
            // eslint-disable-next-line no-console
            console.warn(
                `Please check your parameters: ${JSON.stringify({
                    path: paths,
                    attributes: generalAttrs,
                })}`,
            );
            return Promise.resolve();
        }

        const cluster = getCluster(getState());

        const attributesMap = getNavigationAttributesEditorAttributes(getState());
        const {in_memory_mode, tablet_cell_bundle, ...restGeneralAttrs} = generalAttrs;

        const requests = reduce_(
            paths,
            (acc, path) => {
                const attrs = attributesMap[path] || {};
                const newAttrs = {...restGeneralAttrs, ...storageAttrs};
                const type = ypath.getValue(attrs, '/@type');
                const isDynamic = ypath.getValue(attrs, '/@dynamic');
                const isDynTable = type === 'table' && isDynamic;
                if (in_memory_mode !== undefined && isDynTable) {
                    Object.assign(newAttrs, {in_memory_mode});
                }
                if (tablet_cell_bundle !== undefined && (type === 'map_node' || isDynTable)) {
                    Object.assign(newAttrs, {tablet_cell_bundle});
                }

                forEach_(newAttrs, (value, key) => {
                    acc.push(prepareSetCommandForBatch(`${path}/@${key}`, value, EDIT_MARKER));
                });
                return acc;
            },
            [] as Array<BatchSubRequest>,
        );

        const staticTables = getNavigationAttributesEditorStaticTables(getState());

        return executeBatchWithRetries(YTApiId.attributesEditorSet, requests, {
            errorTitle: `Cannot set attributes for ${paths}`,
        })
            .then((res): Promise<unknown> => {
                const error = getBatchError(res, `Cannot set attributes for ${paths}`);
                if (error) {
                    dispatch({
                        type: NAVIGATION_ATTRIBUTES_EDITOR_ERROR,
                        data: error,
                    });
                    return Promise.reject(error);
                }
                if (!runMerge || !staticTables.length || isEmpty_(storageAttrs)) {
                    return Promise.resolve(res);
                }

                const prepareMergeParams = (path: string) => {
                    return {
                        spec: Object.assign({
                            input_table_paths: [path],
                            output_table_path: path,
                            force_transform: true,
                            mode: 'ordered',
                        }),
                        ...EDIT_MERGE_MARKER,
                    };
                };

                if (staticTables.length < 6) {
                    const promises = map_(staticTables, (path) => {
                        return wrapApiPromiseByToaster(yt.v3.merge(prepareMergeParams(path)), {
                            toasterName: 'storage_attrs_' + path,
                            successContent(res: string) {
                                const opId = JSON.parse(res);
                                return (
                                    <AppStoreProvider>
                                        <OperationShortInfo
                                            id={opId}
                                            output_attribute_name={'/spec/output_table_path'}
                                        />
                                    </AppStoreProvider>
                                );
                            },
                            successTitle: 'Merge operation is started',
                            errorTitle: 'Merge operation is failed',
                            autoHide: false,
                        });
                    });
                    return Promise.all(promises);
                } else {
                    const requests = map_(staticTables, (path) => {
                        return {
                            command: 'merge' as const,
                            parameters: prepareMergeParams(path),
                        };
                    });
                    return executeBatchWithRetries(YTApiId.attributesEditorMerge, requests, {
                        errorTitle: 'Failed to start some operations',
                    }).then((results: any) => {
                        const error = getBatchError(results, 'Failed to start some operations');
                        if (error) {
                            throw error;
                        }

                        toaster.add({
                            theme: 'success',
                            name: 'merge_' + staticTables.join(','),
                            title: `${staticTables.length} operations are started`,
                            content: (
                                <span>
                                    Please visit
                                    <Link url={`/${cluster}/operations`}> operations </Link>
                                    page to see more details
                                </span>
                            ),
                        });
                    });
                }
            })
            .then(() => {
                dispatch(updateView());
                dispatch({
                    type: NAVIGATION_ATTRIBUTES_EDITOR_PARTIAL,
                    data: {paths: undefined, visible: false},
                });
            })
            .catch((e: any) => {
                dispatch({
                    type: NAVIGATION_ATTRIBUTES_EDITOR_ERROR,
                    data: e,
                });
                return Promise.reject(e);
            });
    };
}
