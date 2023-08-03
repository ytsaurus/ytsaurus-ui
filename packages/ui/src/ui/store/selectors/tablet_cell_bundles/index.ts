import _ from 'lodash';

import {RootState} from '../../../store/reducers';
import {
    aggregateTotal,
    tabletActiveBundleLink,
    tabletCellBundleRootLink,
} from '../../../utils/components/tablet-cells';
import {
    AllocatedInstancesMap,
    InProgressInstancesMap,
    TabletBundle,
    TabletCell,
} from '../../../store/reducers/tablet_cell_bundles';
import {createSelector} from 'reselect';
import {concatByAnd} from '../../../common/hammer/predicate';
import {prepareHost} from '../../../utils';
import {getCluster} from '../global';
import {
    multiSortWithUndefined,
    orderTypeToOrderK,
    sortArrayBySortState,
} from '../../../utils/sort-helpers';
import {makeNodeUrl, makeProxyUrl} from '../../../utils/app-url';
import {
    getTabletCellBundleControllerInstanceDetailsMap,
    getTabletCellBundleEditorState,
} from './tablet-cell-bundle-editor';
import {BundleControllerInstanceDetails} from '../../../store/reducers/tablet_cell_bundles/tablet-cell-bundle-editor';
import UIFactory from '../../../UIFactory';

export const getTabletsIsLoaded = (state: RootState) => state.tablet_cell_bundles.loaded;
export const getTabletsIsLoading = (state: RootState) => state.tablet_cell_bundles.loading;
export const getTabletsError = (state: RootState) => state.tablet_cell_bundles.error;

export const getTabletsBundlesSortState = (state: RootState) =>
    state.tablet_cell_bundles.bundlesSort;

export const getTabletsBundlesNameFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesNameFilter;
export const getTabletsBundlesAccountFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesAccountFilter;
export const getTabletsBundlesTagNodeFilter = (state: RootState) =>
    state.tablet_cell_bundles.bundlesTagNodeFilter;

export const getTabletsBundles = (state: RootState) => state.tablet_cell_bundles.bundles;

export const getTabletsActiveBundle = (state: RootState) => state.tablet_cell_bundles.activeBundle;

export const getBundleDefaultConfig = (state: RootState) =>
    state.tablet_cell_bundles.bundleDefaultConfig;

export const getTabletBundlesTableMode = (state: RootState) =>
    state.tablet_cell_bundles.bundlesTableMode;

export const getTabletBundlesWriteableByName = (state: RootState) =>
    state.tablet_cell_bundles.writableByName;

export const getTabletsActiveBundleData = createSelector(
    [getTabletsBundles, getTabletsActiveBundle],
    (bundles, activeBundle) => {
        return _.find(bundles, (item) => item.bundle === activeBundle);
    },
);

function prepareBundleInstances(
    allocated: AllocatedInstancesMap,
    inProgresss: InProgressInstancesMap,
    instanceDetailsMap: Record<string, BundleControllerInstanceDetails>,
    makeUrl: (address: string) => string,
) {
    return [
        ..._.map(allocated, (data, address) => {
            const details = instanceDetailsMap?.[address] || {};

            const {pod_id, yp_cluster} = data || {};
            const deployUrl = UIFactory.getNodeDeployUrl(yp_cluster, pod_id);

            const {nanny_service, tablet_static_memory} = details;
            const nannyUrl = UIFactory.getNodeNannyUrl({nanny_service, pod_id, yp_cluster});

            return {
                address,
                data,
                url: makeUrl(address),
                allocationState: data.removing ? 'Removing' : undefined,
                tablet_static_memory,
                deployUrl,
                nannyUrl,
            };
        }),
        ..._.map(inProgresss, (item) => {
            return {
                data: item.instance_info,
                allocationState: item.hulk_request_state,
                hulkRequestPath: item.hulk_request_link,
            };
        }),
    ];
}

export const getActiveBundleControllerData = createSelector(
    [getTabletsActiveBundle, getTabletCellBundleEditorState],
    (activeBundle, {bundleData, bundleControllerData}) => {
        if (activeBundle !== bundleData?.bundle) {
            return undefined;
        }

        return bundleControllerData;
    },
);

export const getActiveBundleInstances = createSelector(
    [getActiveBundleControllerData, getCluster, getTabletCellBundleControllerInstanceDetailsMap],
    (bundleControllerData, cluster, instanceDetailsMap) => {
        if (!bundleControllerData) {
            return [];
        }

        const {allocated_tablet_nodes, allocating_tablet_nodes} = bundleControllerData;
        return prepareBundleInstances(
            allocated_tablet_nodes,
            allocating_tablet_nodes,
            instanceDetailsMap,
            (address) => makeNodeUrl(cluster, address),
        );
    },
);

export const getActiveBundleProxies = createSelector(
    [getActiveBundleControllerData, getCluster, getTabletCellBundleControllerInstanceDetailsMap],
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

export const getBundleEditorData = createSelector(
    [getTabletCellBundleEditorState, getBundleDefaultConfig],
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

export const getTabletsBundlesTotal = createSelector(
    [getTabletsBundles],
    (bundles): TabletBundle => aggregateTotal(bundles),
);

const COLUMNS_SORTABLE_AS_IS = new Set<keyof TabletBundle>([
    'bundle',
    'health',
    'tabletCells',
    'tablets',
    'uncompressed',
    'compressed',
    'enable_bundle_balancer',
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

export const getTabletsBundlesFiltered = createSelector(
    [
        getTabletsBundles,
        getTabletsBundlesNameFilter,
        getTabletsBundlesAccountFilter,
        getTabletsBundlesTagNodeFilter,
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

        return !predicates.length ? bundles : _.filter(bundles, concatByAnd(...predicates));
    },
);

function compareBundlesByAccount(left: TabletBundle, right: TabletBundle) {
    if (
        left.changelog_account === right.changelog_account &&
        left.snapshot_account === right.snapshot_account
    ) {
        return 0;
    }

    return left.changelog_account < right.changelog_account
        ? -1
        : left.snapshot_account < right.snapshot_account
        ? -1
        : 1;
}

export const getTabletsBundlesSorted = createSelector(
    [getTabletsBundlesFiltered, getTabletsBundlesSortState],
    (bundles, sortState) => {
        const {column, order} = sortState || {};
        if (!column || !order) {
            return bundles;
        }

        let sorted = bundles;

        const {orderK, undefinedOrderK} = orderTypeToOrderK(order);

        if (column === 'changelog_account') {
            sorted = [...bundles].sort(compareBundlesByAccount);
        } else if (column === 'nodes') {
            sorted = [...bundles].sort(({nodes: l = []}, {nodes: r = []}) => l.length - r.length);
        } else if (COLUMNS_SORTABLE_AS_IS.has(column)) {
            return multiSortWithUndefined(bundles, [{key: column, orderK, undefinedOrderK}]);
        }

        return order === 'asc' ? sorted : sorted.reverse();
    },
);

export const getTabletsCells = (state: RootState) => state.tablet_cell_bundles.cells;
export const getTabletsCellsSortState = (state: RootState) => state.tablet_cell_bundles.cellsSort;

export const getTabletsCellsIdFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsIdFilter;
export const getTabletsCellsBundleFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsBundleFilter;
export const getTabletsCellsHostFilter = (state: RootState) =>
    state.tablet_cell_bundles.cellsHostFilter;

export const getTabletCellsOfActiveAccount = createSelector(
    [getTabletsCells, getTabletsActiveBundle],
    (cells, activeBundle) => {
        if (!activeBundle) {
            return cells;
        }

        return _.filter(cells, (item) => {
            return Boolean(item.bundle) && activeBundle === item.bundle;
        });
    },
);

export const getTabletsCellsFiltered = createSelector(
    [
        getTabletCellsOfActiveAccount,
        getTabletsCellsIdFilter,
        getTabletsCellsBundleFilter,
        getTabletsCellsHostFilter,
        getTabletsActiveBundle,
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
        return !predicates.length ? cells : _.filter(cells, concatByAnd(...predicates));
    },
);

export function filterTabletCellsByBundle(bundle: string, cells: Array<TabletCell>) {
    if (!bundle) {
        return [];
    }

    return _.filter(cells, (item) => item.bundle === bundle);
}

export const getTabletsCellsSorted = createSelector(
    [getTabletsCellsFiltered, getTabletsCellsSortState],
    (cells, sortState) => {
        return sortArrayBySortState(cells, sortState);
    },
);

export const getTabletsCellsBundles = createSelector([getTabletsCells], (cells) => {
    return _.uniq(_.map(cells, 'bundle')).sort();
});

export const getTabletsCellsHosts = createSelector([getTabletCellsOfActiveAccount], (cells) => {
    return _.uniq(_.map(cells, 'peerAddress')).sort();
});

export const getTabletsCellsHostsOfActiveBundle = createSelector(
    [getTabletsActiveBundle, getTabletsCellsFiltered],
    (activeBundle: string, cells: Array<TabletCell>) => {
        if (!activeBundle) {
            return '';
        }
        return prepareHostsFromCells(cells);
    },
);

export function prepareHostsFromCells(cells: Array<TabletCell>) {
    return _.uniq(_.map(cells, ({peerAddress}) => prepareHost(peerAddress)).filter(Boolean))
        .sort()
        .join('|');
}

export interface TabletsCellBundlesBreadcrumbsItem {
    text: string;
    href: string;
    title?: string;
}

export const getTabletsBreadcrumbItems = createSelector(
    [getCluster, getTabletsActiveBundleData],
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
