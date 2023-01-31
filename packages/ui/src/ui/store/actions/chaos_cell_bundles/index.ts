import copy from 'copy-to-clipboard';
import type {ThunkAction} from 'redux-thunk';

import {
    CHAOS_BUNDLES_ACTIVE_ACCOUNT,
    CHAOS_BUNDLES_LOAD_FAILURE,
    CHAOS_BUNDLES_LOAD_REQUEST,
    CHAOS_BUNDLES_LOAD_SUCCESS,
    CHAOS_BUNDLES_PARTIAL,
} from '../../../constants/tablets';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {bundlesTrackVisit} from '../../../store/actions/favourites';
import type {RootState} from '../../../store/reducers';
import type {
    ChaosBundle,
    ChaosBundlesAction,
    ChaosPartialAction,
} from '../../../store/reducers/chaos_cell_bundles';
import {
    filterChaosCellsByBundle,
    getChaosBundlesSorted,
    getChaosCells,
    prepareHostsFromCells,
} from '../../../store/selectors/chaos_cell_bundles';
import {getCluster} from '../../../store/selectors/global';
import type {SortState} from '../../../types';
import {
    prepareBundles,
    prepareTabletCells,
    tabletActiveBundleLink,
} from '../../../utils/components/tablet-cells';
import {getBatchError} from '../../../utils/utils';
import {getAppBrowserHistory} from '../../../store/window-store';

type ChaosBundlesThunkAction = ThunkAction<void, RootState, unknown, ChaosBundlesAction>;

export function fetchChaosBundles(): ChaosBundlesThunkAction {
    return (dispatch) => {
        dispatch({type: CHAOS_BUNDLES_LOAD_REQUEST});
        const requests = [
            {
                command: 'list' as const,
                parameters: {
                    path: '//sys/chaos_cells',
                    attributes: [
                        'alien_config_versions',
                        'area_id',
                        'area',
                        'builtin',
                        'config_version',
                        'descriptor_config_version',
                        'effective_acl',
                        'ephemeral_ref_counter',
                        'estimated_creation_time',
                        'foreign',
                        'health',
                        'id',
                        'leading_peer_id',
                        'life_stage',
                        'local_health',
                        // 'max_changelog_id',
                        // 'max_snapshot_id',
                        'multicell_status',
                        'native_cell_tag',
                        'opaque_attribute_keys',
                        'peers',
                        'ref_counter',
                        'sequoia',
                        'status',
                        'suspended',
                        'tablet_cell_bundle',
                        'tablet_cell_life_stage',
                        'type',
                        'user_attribute_keys',
                        'user_attributes',
                        'weak_ref_counter',
                    ],
                },
            },
            {
                command: 'get' as const,
                parameters: {
                    path: '//sys/chaos_cell_bundles',
                    attributes: [
                        'acl',
                        'area_nodes',
                        'areas',
                        'builtin',
                        'cell_balancer_config',
                        'chaos_options',
                        'dynamic_config_version',
                        'dynamic_options',
                        'effective_acl',
                        'ephemeral_ref_counter',
                        'estimated_creation_time',
                        'foreign',
                        'health',
                        'id',
                        'inherit_acl',
                        'life_stage',
                        'metadata_cell_id',
                        'name',
                        'native_cell_tag',
                        'opaque_attribute_keys',
                        'options',
                        'owner',
                        'ref_counter',
                        'sequoia',
                        'tablet_cell_count',
                        'tablet_cell_ids',
                        'type',
                        'user_attribute_keys',
                        'user_attributes',
                        'weak_ref_counter',
                    ],
                },
            },
        ];

        return ytApiV3Id
            .executeBatch(YTApiId.chaosCellBundles, {requests})
            .then((results: Array<any>) => {
                const [{output: cells}, {output: bundles}] = results;
                const error = getBatchError(results, 'Tablet cell bundles cannot be loaded');
                if (error) {
                    throw error;
                }

                const allCells = prepareTabletCells(cells);
                const allBundles = prepareBundles(allCells, bundles);

                dispatch({
                    type: CHAOS_BUNDLES_LOAD_SUCCESS,
                    data: {cells: allCells, bundles: allBundles},
                });
            })
            .catch((e: any) => {
                dispatch({type: CHAOS_BUNDLES_LOAD_FAILURE, data: e});
            });
    };
}

export function setChaosBundlesSortState(
    bundlesSort: SortState<keyof ChaosBundle>,
): ChaosBundlesAction {
    return {type: CHAOS_BUNDLES_PARTIAL, data: {bundlesSort}};
}

export function setChaosBundlesNameFilter(bundlesNameFilter: string): ChaosBundlesAction {
    return {type: CHAOS_BUNDLES_PARTIAL, data: {bundlesNameFilter}};
}

export function setChaosBundlesAccountFilter(bundlesAccountFilter: string): ChaosBundlesAction {
    return {type: CHAOS_BUNDLES_PARTIAL, data: {bundlesAccountFilter}};
}

export function setChaosBundlesTagNodeFilter(bundlesTagNodeFilter: string): ChaosBundlesAction {
    return {type: CHAOS_BUNDLES_PARTIAL, data: {bundlesTagNodeFilter}};
}

export function setChaosPartial(data: ChaosPartialAction['data']) {
    return {type: CHAOS_BUNDLES_PARTIAL, data};
}

export function setChaosActiveBundle(activeBundle: string): ChaosBundlesThunkAction {
    return (dispatch) => {
        dispatch(bundlesTrackVisit(activeBundle));
        dispatch({
            type: CHAOS_BUNDLES_ACTIVE_ACCOUNT,
            data: {activeBundle},
        });
    };
}

export function setChaosFirstBundleAsActive(): ChaosBundlesThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const bundles = getChaosBundlesSorted(state);
        const [first] = bundles;
        if (!first) {
            return;
        }

        const cluster = getCluster(state);
        dispatch(setChaosActiveBundle(first.bundle));
        getAppBrowserHistory().push(tabletActiveBundleLink(cluster, first.bundle));
    };
}

export function copyHostListToClipboard(bundle: string): ChaosBundlesThunkAction {
    return (_dispatch, getState) => {
        const cells = filterChaosCellsByBundle(bundle, getChaosCells(getState()));
        const hosts = prepareHostsFromCells(cells);
        copy(hosts || '');
    };
}
