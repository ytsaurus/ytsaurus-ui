import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import {type RootState} from '../../../store/reducers';
import {
    aggregateTotal,
    tabletActiveBundleLink,
    tabletCellBundleRootLink,
} from '../../../utils/components/tablet-cells';
import {
    type AllocatedInstancesMap,
    type InProgressInstancesMap,
    type TabletBundle,
    type TabletCell,
} from '../../../store/reducers/tablet_cell_bundles';
import {createSelector} from 'reselect';
import {concatByAnd} from '../../../common/hammer/predicate';
import {prepareHost} from '../../../utils';
import {selectCluster} from '../global';
import {sortArrayBySortState} from '../../../utils/sort-helpers';
import {sortTableBundles} from '../../../utils/tablet_cell_bundles';
import {makeComponentsNodesUrl, makeProxyUrl} from '../../../utils/app-url';
import {
    selectTabletCellBundleControllerInstanceDetailsMap,
    selectTabletCellBundleEditorState,
} from './tablet-cell-bundle-editor';
import {type BundleControllerInstanceDetails} from '../../../store/reducers/tablet_cell_bundles/tablet-cell-bundle-editor';
import UIFactory from '../../../UIFactory';

export const selectTabletsIsLoaded = (state: RootState) => state.tablet_cell_bundles.loaded;
export const selectTabletsIsLoading = (state: RootState) => state.tablet_cell_bundles.loading;
export const selectTabletsError = (state: RootState) => state.tablet_cell_bundles.error;

export const selectTabletsBundlesSortState = (state: RootState) =>
    state.tablet_cell_bundles.bundlesSort;

export const selectTabletsBundlesNameFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesNameFilter;
export const selectTabletsBundlesAccountFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesAccountFilter;
export const selectTabletsBundlesTagNodeFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesTagNodeFilter;

export const selectTabletsBundles = (state: RootState) => state.tablet_cell_bundles.bundles;

export const selectTabletsActiveBundle = (state: RootState) =>
    state.tablet_cell_bundles.activeBundle;

export const selectBundleDefaultConfig = (state: RootState) =>
    state.tablet_cell_bundles.bundleDefaultConfig;

export const selectTabletBundlesTableMode = (state: RootState) =>
    state.tablet_cell_bundles.bundlesTableMode;

export const selectTabletBundlesWriteableByName = (state: RootState) =>
    state.tablet_cell_bundles.writableByName;

export const selectTabletsActiveBundleData = createSelector(
    [selectTabletsBundles, selectTabletsActiveBundle],
    (bundles, activeBundle) => {
        return find_(bundles, (item) => item.bundle === activeBundle);
    },
);

export const selectTabletsDefaultMemoryConfiguration = createSelector(
    [selectBundleDefaultConfig, selectTabletCellBundleEditorState],
    (config, editorState) => {
        if (!config) return 0;
        const nodeSizes = config.zone_default.tablet_node_sizes;

        const key =
            editorState.bundleData?.bundle_controller_target_config?.tablet_node_resource_guarantee
                .type;

        if (!key || !(key in nodeSizes)) return 0;
        return nodeSizes[key as string].default_config.memory_limits?.reserved || 0;
    },
);

function prepareBundleInstances(
    allocated: AllocatedInstancesMap,
    inProgresss: InProgressInstancesMap,
    instanceDetailsMap: Record<string, BundleControllerInstanceDetails>,
    makeUrl: (address: string) => string,
) {
    return [
        ...map_(allocated, (data, address) => {
            const details = instanceDetailsMap?.[address] || {};

            const {pod_id, yp_cluster} = data || {};
            const deployUrl = UIFactory.getNodeDeployUrl(yp_cluster, pod_id);

            const {nanny_service, tablet_static_memory} = details;
            const nannyUrl = UIFactory.getNodeNannyUrl({nanny_service, pod_id, yp_cluster});

            return {
                address,
                data,
                url: makeUrl(address),
                allocationState: data.removing ? ('removing' as const) : undefined,
                tablet_static_memory,
                deployUrl,
                nannyUrl,
            };
        }),
        ...map_(inProgresss, (item) => {
            return {
                data: item.instance_info,
                allocationState: item.hulk_request_state,
                hulkRequestPath: item.hulk_request_link,
            };
        }),
    ];
}

export const selectActiveBundleControllerData = createSelector(
    [selectTabletsActiveBundle, selectTabletCellBundleEditorState],
    (activeBundle, {bundleData, bundleControllerData}) => {
        if (activeBundle !== bundleData?.bundle) {
            return undefined;
        }

        return bundleControllerData;
    },
);

export const selectActiveBundleInstances = createSelector(
    [
        selectActiveBundleControllerData,
        selectCluster,
        selectTabletCellBundleControllerInstanceDetailsMap,
    ],
    (bundleControllerData, cluster, instanceDetailsMap) => {
        if (!bundleControllerData) {
            return [];
        }

        const {allocated_tablet_nodes, allocating_tablet_nodes} = bundleControllerData;
        return prepareBundleInstances(
            allocated_tablet_nodes,
            allocating_tablet_nodes,
            instanceDetailsMap,
            (address) => makeComponentsNodesUrl({host: address, cluster}),
        );
    },
);

export const selectActiveBundleProxies = createSelector(
    [
        selectActiveBundleControllerData,
        selectCluster,
        selectTabletCellBundleControllerInstanceDetailsMap,
    ],
    (bundleControllerData, cluster, instanceDetailsMap) => {
        if (!bundleControllerData) {
            return [];
        }

        const {allocated_rpc_proxies, allocating_rpc_proxies} = bundleControllerData;
        return prepareBundleInstances(
            allocated_rpc_proxies,
            allocating_rpc_proxies,
            instanceDetailsMap,
            (address) => makeProxyUrl(cluster, address),
        );
    },
);

export const selectBundleEditorData = createSelector(
    [selectTabletCellBundleEditorState, selectBundleDefaultConfig],
    (editorState, defaultConfig) => {
        const {bundleData, data} = editorState;
        const {zone} = bundleData || {};
        return {
            data,
            bundleData,
            defaultConfig: defaultConfig?.[zone || ''],
        };
    },
);

export const selectTabletsBundlesTotal = createSelector(
    [selectTabletsBundles],
    (bundles): TabletBundle => aggregateTotal(bundles),
);

const COLUMNS_SORTABLE_AS_IS = new Set<keyof TabletBundle>([
    'bundle',
    'health',
    'tabletCells',
    'tablets',
    'uncompressed',
    'compressed',
    'enable_bundle_controller',
    'node_tag_filter',
    'memory',
    'tablet_count',
    'tablet_count_limit',
    'tablet_count_free',
    'tablet_count_percentage',
    'tablet_static_memory',
    'tablet_static_memory_limit',
    'tablet_static_memory_free',
    'tablet_static_memory_percentage',
]);

export const selectTabletsBundlesFiltered = createSelector(
    [
        selectTabletsBundles,
        selectTabletsBundlesNameFilter,
        selectTabletsBundlesAccountFilter,
        selectTabletsBundlesTagNodeFilter,
    ],
    (bundles, nameFilter, accountFilter, tagNodeFilter) => {
        const predicates: Array<(item: TabletBundle) => boolean> = [];
        if (nameFilter) {
            const lowerNameFilter = nameFilter.toLowerCase();
            predicates.push((item) => {
                return -1 !== item.bundle.toLowerCase().indexOf(lowerNameFilter);
            });
        }

        if (accountFilter) {
            const lowerAccountFilter = accountFilter.toLowerCase();
            predicates.push((item) => {
                const {changelog_account, snapshot_account} = item;
                return (
                    (Boolean(changelog_account) &&
                        -1 !== changelog_account.toLowerCase().indexOf(lowerAccountFilter)) ||
                    (Boolean(snapshot_account) &&
                        -1 !== snapshot_account.toLowerCase().indexOf(lowerAccountFilter))
                );
            });
        }

        if (tagNodeFilter) {
            const lowerTagNodeFilter = tagNodeFilter.toLowerCase();
            predicates.push((item) => {
                const {node_tag_filter} = item;
                return (
                    Boolean(node_tag_filter) &&
                    -1 !== node_tag_filter.toLowerCase().indexOf(lowerTagNodeFilter)
                );
            });
        }

        return !predicates.length ? bundles : filter_(bundles, concatByAnd(...predicates));
    },
);

export const selectTabletsBundlesSorted = createSelector(
    [selectTabletsBundlesFiltered, selectTabletsBundlesSortState],
    (bundles, sortState) => {
        const {column, order} = sortState || {};
        if (!column || !order) {
            return bundles;
        }

        return sortTableBundles({bundles, column, order, columnsSortable: COLUMNS_SORTABLE_AS_IS});
    },
);

export const selectTabletsCells = (state: RootState) => state.tablet_cell_bundles.cells;
export const selectTabletsCellsSortState = (state: RootState) =>
    state.tablet_cell_bundles.cellsSort;

export const selectTabletsCellsIdFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsIdFilter;
export const selectTabletsCellsBundleFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsBundleFilter;
export const selectTabletsCellsHostFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsHostFilter;

export const selectTabletCellsOfActiveAccount = createSelector(
    [selectTabletsCells, selectTabletsActiveBundle],
    (cells, activeBundle) => {
        if (!activeBundle) {
            return cells;
        }

        return filter_(cells, (item) => {
            return Boolean(item.bundle) && activeBundle === item.bundle;
        });
    },
);

export const selectTabletsCellsFiltered = createSelector(
    [
        selectTabletCellsOfActiveAccount,
        selectTabletsCellsIdFilter,
        selectTabletsCellsBundleFilter,
        selectTabletsCellsHostFilter,
        selectTabletsActiveBundle,
    ],
    (cells, idFilter, bundleFilter, hostFilter) => {
        const predicates: Array<(item: TabletCell) => boolean> = [];
        if (idFilter) {
            predicates.push((item) => {
                return -1 !== item.id.indexOf(idFilter);
            });
        }

        if (bundleFilter) {
            predicates.push((item) => {
                return Boolean(item.bundle) && -1 !== item.bundle.indexOf(bundleFilter);
            });
        }

        if (hostFilter) {
            predicates.push((item) => {
                return Boolean(item.peerAddress) && -1 !== item.peerAddress.indexOf(hostFilter);
            });
        }
        return !predicates.length ? cells : filter_(cells, concatByAnd(...predicates));
    },
);

export function filterTabletCellsByBundle(bundle: string, cells: Array<TabletCell>) {
    if (!bundle) {
        return [];
    }

    return filter_(cells, (item) => item.bundle === bundle);
}

export const selectTabletsCellsSorted = createSelector(
    [selectTabletsCellsFiltered, selectTabletsCellsSortState],
    (cells, sortState) => {
        return sortArrayBySortState(cells, sortState);
    },
);

export const selectTabletsCellsBundles = createSelector([selectTabletsCells], (cells) => {
    return uniq_(map_(cells, 'bundle')).sort();
});

export const selectTabletsCellsHosts = createSelector(
    [selectTabletCellsOfActiveAccount],
    (cells) => {
        return uniq_(map_(cells, 'peerAddress')).sort();
    },
);

export const selectTabletsCellsHostsOfActiveBundle = createSelector(
    [selectTabletsActiveBundle, selectTabletsCellsFiltered],
    (activeBundle: string, cells: Array<TabletCell>) => {
        if (!activeBundle) {
            return '';
        }
        return prepareHostsFromCells(cells);
    },
);

export function prepareHostsFromCells(cells: Array<TabletCell>) {
    return uniq_(map_(cells, ({peerAddress}) => prepareHost(peerAddress)).filter(Boolean))
        .sort()
        .join('|');
}

export interface TabletsCellBundlesBreadcrumbsItem {
    text: string;
    href: string;
    title?: string;
}

export const selectTabletsBreadcrumbItems = createSelector(
    [selectCluster, selectTabletsActiveBundleData],
    (cluster, activeBundleData): Array<TabletsCellBundlesBreadcrumbsItem> => {
        const res: Array<TabletsCellBundlesBreadcrumbsItem> = [
            {
                text: '',
                href: tabletCellBundleRootLink(cluster),
                title: '<bundles>',
            },
        ];

        const {bundle, enable_bundle_controller} = activeBundleData || {};

        if (bundle) {
            res.push({
                text: bundle,
                href: tabletActiveBundleLink(cluster, bundle, enable_bundle_controller),
            });
        }

        return res;
    },
);
