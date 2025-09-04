import type {ThunkAction} from 'redux-thunk';

import forEach_ from 'lodash/forEach';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import {getBatchError} from '../../../../shared/utils/error';

import hammer from '../../../common/hammer';
import {
    TABLETS_BUNDLES_EDITOR_LOAD_FAILURE,
    TABLETS_BUNDLES_EDITOR_LOAD_REQUREST,
    TABLETS_BUNDLES_EDITOR_LOAD_SUCCESS,
    TABLETS_BUNDLES_EDITOR_PARTIAL,
} from '../../../constants/tablets';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import type {RootState} from '../../../store/reducers';
import type {
    BundleControllerInstanceDetails,
    TabletCellBundleEditorAction,
} from '../../../store/reducers/tablet_cell_bundles/tablet-cell-bundle-editor';
import {fetchTabletsBundles} from '../../../store/actions/tablet_cell_bundles';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {makeBatchSubRequest, prepareSetCommandForBatch} from '../../../utils/cypress-attributes';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {
    getTabletsBundles,
    getTabletsDefaultMemoryConfiguration,
} from '../../../store/selectors/tablet_cell_bundles';
import {OrchidBundlesData} from '../../../store/reducers/tablet_cell_bundles';
import {BatchResults, BatchSubRequest} from '../../../../shared/yt-types';

type TabletCellBundleEditorThunkAction = ThunkAction<
    any,
    RootState,
    any,
    TabletCellBundleEditorAction
>;

export function fetchTabletCellBundleEditor(bundleName: string): TabletCellBundleEditorThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        dispatch({type: TABLETS_BUNDLES_EDITOR_LOAD_REQUREST, data: {bundleName}});

        const bundles = getTabletsBundles(state);
        const toEdit = bundles.find(({bundle}) => bundle === bundleName);
        if (!toEdit) {
            return Promise.resolve();
        }
        const defaultReservedMemoryLimit = getTabletsDefaultMemoryConfiguration(state);

        const requests: Array<BatchSubRequest> = [
            {
                command: 'get',
                parameters: {
                    path: `//sys/tablet_cell_bundles/${bundleName}`,
                    attributes: [
                        'resource_usage',
                        'resource_limits',
                        'options',
                        'abc',
                        'folder_id',
                        'zone',
                        'enable_bundle_controller',
                    ],
                },
            },
        ];

        if (toEdit.enable_bundle_controller) {
            requests.push({
                command: 'get',
                parameters: {
                    path: `//sys/bundle_controller/orchid/bundle_controller/state/bundles/${bundleName}`,
                },
            });
        }

        return wrapApiPromiseByToaster(
            ytApiV3Id
                .executeBatch(YTApiId.tabletCellBundlesEditData, {requests})
                .then((results) => {
                    const bundleControllerIsUnavailable =
                        toEdit.enable_bundle_controller &&
                        results[2]?.error?.code === yt.codes.NODE_DOES_NOT_EXIST;
                    const error = getBatchError(
                        bundleControllerIsUnavailable ? [results[0]] : results,
                        'Failed to get bundle edit data',
                    );

                    if (error) {
                        throw error;
                    }
                    return results;
                }),
            {
                toasterName: 'edit-bundle-data',
                skipSuccessToast: true,
                errorContent: 'Failed to load bundle details',
            },
        )
            .then((results) => {
                const [{output: data}, {output: bundleControllerData} = {output: undefined}] =
                    results as BatchResults<[unknown, OrchidBundlesData]>;

                let bundleData = toEdit;

                if (
                    !toEdit.bundle_controller_target_config?.memory_limits.reserved &&
                    defaultReservedMemoryLimit
                ) {
                    bundleData = {
                        ...toEdit,
                        bundle_controller_target_config: {
                            ...toEdit.bundle_controller_target_config!,
                            memory_limits: {
                                ...toEdit.bundle_controller_target_config?.memory_limits,
                                reserved: defaultReservedMemoryLimit,
                            },
                        },
                    };
                }

                dispatch({
                    type: TABLETS_BUNDLES_EDITOR_LOAD_SUCCESS,
                    data: {
                        bundleData,
                        data,
                        bundleControllerData,
                    },
                });

                const requestGroups: Array<Array<BatchSubRequest>> = [
                    ...map_(bundleControllerData?.allocated_tablet_nodes, (_item, key) => {
                        return [
                            makeBatchSubRequest('get', {
                                path: `//sys/cluster_nodes/${key}/@bundle_controller_annotations/nanny_service`,
                            }),
                            makeBatchSubRequest('get', {
                                path: `//sys/cluster_nodes/${key}/@statistics/memory/tablet_static`,
                            }),
                        ];
                    }),
                    ...map_(bundleControllerData?.allocated_rpc_proxies, (_item, key) => {
                        return [
                            makeBatchSubRequest('get', {
                                path: `//sys/rpc_proxies/${key}/@bundle_controller_annotations/nanny_service`,
                            }),
                        ];
                    }),
                ];
                const errors = [];
                wrapApiPromiseByToaster(
                    ytApiV3Id.executeBatch(YTApiId.tabletCellBundlesInstancesDetails, {
                        requests: map_(requestGroups, (item) => {
                            return makeBatchSubRequest('execute_batch', {requests: item});
                        }),
                    }),
                    {
                        toasterName: 'bundle-controller-tablet-static-memory',
                        skipSuccessToast: true,
                        errorContent:
                            'BundleController: Cannot load tablet static memory of isntances',
                    },
                ).then((nodesResults) => {
                    const keys = [
                        ...keys_(bundleControllerData?.allocated_tablet_nodes),
                        ...keys_(bundleControllerData?.allocated_rpc_proxies),
                    ];
                    const instanceDetailsMap: Record<string, BundleControllerInstanceDetails> = {};
                    forEach_(nodesResults, ({output, error}, index) => {
                        if (error) {
                            errors.push(error);
                        } else {
                            const [
                                {output: nanny_service},
                                {output: tablet_static_memory} = {output: undefined},
                            ] = output;
                            instanceDetailsMap[keys[index]] = {
                                nanny_service,
                                tablet_static_memory,
                            };
                        }
                    });
                    dispatch({type: TABLETS_BUNDLES_EDITOR_PARTIAL, data: {instanceDetailsMap}});
                });
            })
            .catch((e: any) => {
                dispatch({
                    type: TABLETS_BUNDLES_EDITOR_LOAD_FAILURE,
                    data: e,
                });
                return Promise.reject(e);
            });
    };
}

export function showTabletCellBundleEditor(bundle: string): TabletCellBundleEditorThunkAction {
    return (dispatch) => {
        dispatch(fetchTabletCellBundleEditor(bundle)).then(() => {
            dispatch({type: TABLETS_BUNDLES_EDITOR_PARTIAL, data: {visibleEditor: true}});
        });
    };
}

export function hideTabletCellBundleEditor(): TabletCellBundleEditorThunkAction {
    return (dispatch) => {
        dispatch({
            type: TABLETS_BUNDLES_EDITOR_PARTIAL,
            data: {bundleName: undefined, loaded: true, visibleEditor: false},
        });
    };
}

export type BundleResourceType = 'tablet_count' | 'tablet_static_memory';

export function setBundleQuota(params: {
    bundleName: string;
    resourceType: BundleResourceType;
    limit: number;
}): TabletCellBundleEditorThunkAction {
    return (dispatch) => {
        const {bundleName, resourceType, limit} = params;

        const resource = hammer.format['Readable'](resourceType);

        return wrapApiPromiseByToaster(
            yt.v3.set(
                {
                    path: `//sys/tablet_cell_bundles/${bundleName}/@resource_limits/${resourceType}`,
                },
                limit,
            ),
            {
                toasterName: `edit_bundle_${bundleName}`,
                successContent: `Set quota limit for ${resource}`,
                errorContent: `Cannot set quota limit for ${resource}`,
            },
        ).then(() => {
            dispatch(showTabletCellBundleEditor(bundleName));
        });
    };
}

export function setBundleEditorController(params: {
    bundleName: string;
    data: Record<string, unknown>;
}): TabletCellBundleEditorThunkAction {
    return (dispatch) => {
        const {bundleName, data} = params;

        const bundlePath = `//sys/tablet_cell_bundles/${bundleName}`;

        const requests = map_(data, (value, path) =>
            prepareSetCommandForBatch(`${bundlePath}/${path}`, value),
        );

        return wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch(YTApiId.tabletCellBundlesSetAttrs, {
                requests,
            } as any),
            {
                toasterName: `edit_bundle_${bundleName}`,
                successContent: `Set bundle edit data`,
                batchType: 'v3',
                errorTitle: 'Failed to set bundle edit data',
            },
        ).then(() => {
            dispatch(fetchTabletsBundles());
        });
    };
}

export interface EditBundleParams {
    attributes: {
        abc?: {
            id: number;
            slug: string;
        };
    };
    options: {
        changelog_account?: string;
        snapshot_account?: string;
    };
}

export function setBunndleAttributes(
    bundle: string,
    attrs: Partial<EditBundleParams>,
): TabletCellBundleEditorThunkAction {
    return (dispatch) => {
        const {attributes, options} = attrs;

        const bundlePath = `//sys/tablet_cell_bundles/${bundle}`;

        return wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch(YTApiId.tabletCellBundlesSetAttrs, {
                requests: [
                    ...map_(attributes, (v, key) =>
                        prepareSetCommandForBatch(`${bundlePath}/@${key}`, v),
                    ),
                    ...map_(options, (v, key) =>
                        prepareSetCommandForBatch(`${bundlePath}/@options/${key}`, v),
                    ),
                ],
            } as any),
            {
                toasterName: `update-bundle_${bundle}`,
                successContent: `${bundle} successfully updated`,
                batchType: 'v3',
                errorTitle: 'Failed to edit bundle',
            },
        ).then(() => {
            dispatch(showTabletCellBundleEditor(bundle));
        });
    };
}
