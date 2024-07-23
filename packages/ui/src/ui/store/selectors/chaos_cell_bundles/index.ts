import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import {createSelector} from 'reselect';

import {concatByAnd} from '../../../common/hammer/predicate';
import type {RootState} from '../../../store/reducers';
import type {ChaosBundle, ChaosCell} from '../../../store/reducers/chaos_cell_bundles';
import {getCluster} from '../../../store/selectors/global';
import {
    aggregateTotal,
    tabletActiveChaosBundleLink,
    tabletChaosBundleRootLink,
} from '../../../utils/components/tablet-cells';
import {prepareHost} from '../../../utils';
import {sortArrayBySortState} from '../../../utils/sort-helpers';
import {sortTableBundles} from '../../../utils/tablet_cell_bundles';

export const getChaosIsLoaded = (state: RootState) => state.chaos_cell_bundles.loaded;
export const getChaosIsLoading = (state: RootState) => state.chaos_cell_bundles.loading;
export const getChaosError = (state: RootState) => state.chaos_cell_bundles.error;

export const getChaosBundlesSortState = (state: RootState) => state.chaos_cell_bundles.bundlesSort;

export const getChaosBundlesNameFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesNameFilter;
export const getChaosBundlesAccountFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesAccountFilter;
export const getChaosBundlesTagNodeFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesTagNodeFilter;

export const getChaosBundles = (state: RootState) => state.chaos_cell_bundles.bundles;

export const getChaosActiveBundle = (state: RootState) => state.chaos_cell_bundles.activeBundle;

export const getChaosBundlesTableMode = (state: RootState) =>
    state.chaos_cell_bundles.bundlesTableMode;

export const getChaosActiveBundleData = createSelector(
    [getChaosBundles, getChaosActiveBundle],
    (bundles, activeBundle) => {
        return find_(bundles, (item) => item.bundle === activeBundle);
    },
);

export const getChaosBundlesTotal = createSelector(
    [getChaosBundles],
    (bundles): ChaosBundle => aggregateTotal(bundles),
);

const COLUMNS_SORTABLE_AS_IS = new Set<keyof ChaosBundle>([
    'bundle',
    'health',
    'tabletCells',
    'tablets',
    'uncompressed',
    'compressed',
    'enable_bundle_balancer',
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

export const getChaosBundlesFiltered = createSelector(
    [
        getChaosBundles,
        getChaosBundlesNameFilter,
        getChaosBundlesAccountFilter,
        getChaosBundlesTagNodeFilter,
    ],
    (bundles, nameFilter, accountFilter, tagNodeFilter) => {
        const predicates: Array<(item: ChaosBundle) => boolean> = [];
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

export const getChaosBundlesSorted = createSelector(
    [getChaosBundlesFiltered, getChaosBundlesSortState],
    (bundles, {column, order}) => {
        if (!column || !order) {
            return bundles;
        }

        return sortTableBundles({bundles, column, order, columnsSortable: COLUMNS_SORTABLE_AS_IS});
    },
);

export const getChaosCells = (state: RootState) => state.chaos_cell_bundles.cells;
export const getChaosCellsSortState = (state: RootState) => state.chaos_cell_bundles.cellsSort;

export const getChaosCellsIdFilter = (state: RootState) => state.chaos_cell_bundles.cellsIdFilter;
export const getChaosCellsBundleFilter = (state: RootState) =>
    state.chaos_cell_bundles.cellsBundleFilter;
export const getChaosCellsHostFilter = (state: RootState) =>
    state.chaos_cell_bundles.cellsHostFilter;

export const getChaosCellsOfActiveAccount = createSelector(
    [getChaosCells, getChaosActiveBundle],
    (cells, activeBundle) => {
        if (!activeBundle) {
            return cells;
        }

        return filter_(cells, (item) => {
            return Boolean(item.bundle) && activeBundle === item.bundle;
        });
    },
);

export const getChaosCellsFiltered = createSelector(
    [
        getChaosCellsOfActiveAccount,
        getChaosCellsIdFilter,
        getChaosCellsBundleFilter,
        getChaosCellsHostFilter,
        getChaosActiveBundle,
    ],
    (cells, idFilter, bundleFilter, hostFilter) => {
        const predicates: Array<(item: ChaosCell) => boolean> = [];
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

export function filterChaosCellsByBundle(bundle: string, cells: Array<ChaosCell>) {
    if (!bundle) {
        return [];
    }

    return filter_(cells, (item) => item.bundle === bundle);
}

export const getChaosCellsSorted = createSelector(
    [getChaosCellsFiltered, getChaosCellsSortState],
    (cells, sortState) => {
        return sortArrayBySortState(cells, sortState);
    },
);

export const getChaosCellsBundles = createSelector([getChaosCells], (cells) => {
    return uniq_(map_(cells, 'bundle')).sort();
});

export const getChaosCellsHosts = createSelector([getChaosCellsOfActiveAccount], (cells) => {
    return uniq_(map_(cells, 'peerAddress')).sort();
});

export const getChaosCellsHostsOfActiveBundle = createSelector(
    [getChaosActiveBundle, getChaosCellsFiltered],
    (activeBundle: string, cells: Array<ChaosCell>) => {
        if (!activeBundle) {
            return '';
        }
        return prepareHostsFromCells(cells);
    },
);

export function prepareHostsFromCells(cells: Array<ChaosCell>) {
    return uniq_(map_(cells, ({peerAddress}) => prepareHost(peerAddress)).filter(Boolean))
        .sort()
        .join('|');
}

export interface ChaosCellBundlesBreadcrumbsItem {
    text: string;
    href: string;
    title?: string;
}

export const getChaosBreadcrumbItems = createSelector(
    [getCluster, getChaosActiveBundle],
    (cluster, activeBundle): Array<ChaosCellBundlesBreadcrumbsItem> => {
        const res: Array<ChaosCellBundlesBreadcrumbsItem> = [
            {
                text: '',
                href: tabletChaosBundleRootLink(cluster),
                title: '<bundles>',
            },
        ];

        if (activeBundle) {
            res.push({
                text: activeBundle,
                href: tabletActiveChaosBundleLink(cluster, activeBundle),
            });
        }

        return res;
    },
);
