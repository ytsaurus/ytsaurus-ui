import {ThunkAction} from 'redux-thunk';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

// @ts-ignore
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

import {CheckPermissionResult} from '../../../../shared/utils/check-permission';
import {getBatchError, splitBatchResults} from '../../../../shared/utils/error';

import {RootState} from '../../reducers';
import {
    TabletBundle,
    TabletsBundlesAction,
    TabletsPartialAction,
} from '../../reducers/tablet_cell_bundles';
import {
    TABLETS_BUNDLES_ACTIVE_ACCOUNT,
    TABLETS_BUNDLES_LOAD_FAILURE,
    TABLETS_BUNDLES_LOAD_REQUEST,
    TABLETS_BUNDLES_LOAD_SUCCESS,
    TABLETS_BUNDLES_PARTIAL,
} from '../../../constants/tablets';
import {
    prepareBundles,
    prepareTabletCells,
    tabletActiveBundleLink,
} from '../../../utils/components/tablet-cells';
import {SortState} from '../../../types';
import {bundlesTrackVisit} from '../favourites';
import {
    filterTabletCellsByBundle,
    getTabletsBundlesSorted,
    getTabletsCells,
    prepareHostsFromCells,
} from '../../selectors/tablet_cell_bundles';

import copy from 'copy-to-clipboard';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {getCluster, getCurrentUserName} from '../../selectors/global';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getAppBrowserHistory} from '../../../store/window-store';
import {BatchSubRequest} from '../../../../shared/yt-types';
import {makeCheckPermissionBatchSubRequestUI} from '../../../utils/acl/acl-api';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {USE_MAX_SIZE} from '../../../../shared/constants/yt-api';

function getZones(allBundles: TabletBundle[]) {
    const map = new Map<string, boolean>();
    allBundles.forEach(({bundle}) => {
        if (!map.has(bundle)) {
            map.set(bundle, true);
        }
    });

    return [...map.keys()];
}

function prepareBundleDefaultConfig(result: object) {
    return Object.entries(result).reduce((acc, [k, v]) => {
        acc[k] = ypath.getValue(v, '/@');
        return acc;
    }, Object.create(null));
}

type TabletsBundlesThunkAction = ThunkAction<any, RootState, any, TabletsBundlesAction>;

const cancelHelper = new CancelHelper();

export function fetchTabletsBundles(): TabletsBundlesThunkAction {
    return (dispatch) => {
        dispatch({type: TABLETS_BUNDLES_LOAD_REQUEST});
        const requests: BatchSubRequest[] = [
            {
                command: 'exists' as const,
                parameters: {
                    path: '//sys/bundle_controller/orchid/bundle_controller/state/bundles',
                },
            },
            {
                command: 'list' as const,
                parameters: {
                    path: '//sys/tablet_cells',
                    attributes: ['peers', 'id', 'tablet_cell_bundle', 'total_statistics', 'status'],
                    ...USE_MAX_SIZE,
                },
            },
            {
                command: 'get' as const,
                parameters: {
                    path: '//sys/tablet_cell_bundles',
                    attributes: [
                        'nodes',
                        'health',
                        'options',
                        'node_tag_filter',
                        'resource_limits',
                        'resource_usage',
                        'folder_id',
                        'abc',
                        'dynamic_options',
                        'bundle_controller_target_config',
                        'enable_bundle_controller',
                        'zone',
                    ],
                    ...USE_MAX_SIZE,
                },
            },
        ];

        cancelHelper.removeAllRequests();

        return ytApiV3Id
            .executeBatch(YTApiId.tabletCellBundles, {
                parameters: {requests},
                cancellation: cancelHelper.saveCancelToken,
            })
            .then((results: Array<any>) => {
                const [{output: isBundleControllerSupported}, ...rest] = results;

                const [{output: cells}, {output: bundles}] = rest;

                const error = getBatchError(rest, 'Tablet cell bundles cannot be loaded');
                if (error) {
                    throw error;
                }

                const allCells = prepareTabletCells(cells);
                const allBundles = prepareBundles(allCells, bundles);

                const zones = getZones(allBundles);

                dispatch(fetchWritePermissions(allBundles));

                if (!zones.length || !isBundleControllerSupported) {
                    dispatch({
                        type: TABLETS_BUNDLES_LOAD_SUCCESS,
                        data: {
                            cells: allCells,
                            bundles: allBundles,
                        },
                    });
                    return;
                }

                ytApiV3Id
                    .get(YTApiId.bundleControllerZones, {
                        parameters: {
                            path: `//sys/bundle_controller/controller/zones`,
                            attributes: ['tablet_node_sizes', 'rpc_proxy_sizes', 'data_centers'],
                        },
                        cancellation: cancelHelper.saveCancelToken,
                    })
                    .then((result: object) => {
                        const bundleDefaultConfig = prepareBundleDefaultConfig(result);
                        dispatch({
                            type: TABLETS_BUNDLES_LOAD_SUCCESS,
                            data: {
                                cells: allCells,
                                bundles: allBundles,
                                bundleDefaultConfig,
                            },
                        });
                    })
                    .catch((e: any) => {
                        if (!isCancelled(e)) {
                            dispatch({type: TABLETS_BUNDLES_LOAD_FAILURE, data: e});
                        }
                    });
            })
            .catch((e: any) => {
                if (!isCancelled(e)) {
                    dispatch({type: TABLETS_BUNDLES_LOAD_FAILURE, data: e});
                }
            });
    };
}

export function fetchWritePermissions(
    bundles: Array<{bundle: string}> = [],
): TabletsBundlesThunkAction {
    return (dispatch, getState) => {
        const user = getCurrentUserName(getState());
        const requests: Array<BatchSubRequest> = map_(bundles, (item) => {
            return makeCheckPermissionBatchSubRequestUI({
                path: `//sys/tablet_cell_bundles/${item.bundle}`,
                user,
                permission: 'write',
            });
        });
        return wrapApiPromiseByToaster(
            ytApiV3Id
                .executeBatch(YTApiId.tabletBundlesCheckWrite, {
                    parameters: {requests},
                    cancellation: cancelHelper.saveCancelToken,
                })
                .then((data) => {
                    const {error, outputs} = splitBatchResults<CheckPermissionResult>(
                        data,
                        'Failed to get bundle permissions',
                    );
                    const writableByName = reduce_(
                        outputs,
                        (acc, item, index) => {
                            if (item?.action === 'allow') {
                                const name = bundles[index].bundle;
                                acc.set(name, true);
                            }
                            return acc;
                        },
                        new Map<string, boolean>(),
                    );

                    dispatch({type: TABLETS_BUNDLES_PARTIAL, data: {writableByName}});

                    return error ? Promise.reject(error) : undefined;
                }),
            {
                toasterName: 'bundleWritePermissions',
                skipSuccessToast: true,
                errorTitle: 'Fetch write permissions',
            },
        );
    };
}

export function setTabletsBundlesSortState(
    bundlesSort: SortState<keyof TabletBundle>,
): TabletsBundlesAction {
    return {type: TABLETS_BUNDLES_PARTIAL, data: {bundlesSort}};
}

export function setTabletsBundlesNameFilter(bundlesNameFilter: string): TabletsBundlesAction {
    return {type: TABLETS_BUNDLES_PARTIAL, data: {bundlesNameFilter}};
}

export function setTabletsBundlesAccountFilter(bundlesAccountFilter: string): TabletsBundlesAction {
    return {type: TABLETS_BUNDLES_PARTIAL, data: {bundlesAccountFilter}};
}

export function setTabletsBundlesTagNodeFilter(bundlesTagNodeFilter: string): TabletsBundlesAction {
    return {type: TABLETS_BUNDLES_PARTIAL, data: {bundlesTagNodeFilter}};
}

export function setTabletsPartial(data: TabletsPartialAction['data']) {
    return {type: TABLETS_BUNDLES_PARTIAL, data};
}

export function setTabletsActiveBundle(activeBundle: string): TabletsBundlesThunkAction {
    return (dispatch) => {
        dispatch(bundlesTrackVisit(activeBundle));
        dispatch({
            type: TABLETS_BUNDLES_ACTIVE_ACCOUNT,
            data: {activeBundle},
        });
    };
}

export function setTabletsFirstBundleAsActive(): TabletsBundlesThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const bundles = getTabletsBundlesSorted(state);
        const [first] = bundles;
        if (!first) {
            return;
        }

        const cluster = getCluster(state);
        dispatch(setTabletsActiveBundle(first.bundle));
        getAppBrowserHistory().push(tabletActiveBundleLink(cluster, first.bundle));
    };
}

export function copyHostListToClipboard(bundle: string): TabletsBundlesThunkAction {
    return (_dispatch, getState) => {
        const cells = filterTabletCellsByBundle(bundle, getTabletsCells(getState()));
        const hosts = prepareHostsFromCells(cells);
        copy(hosts || '');
    };
}
