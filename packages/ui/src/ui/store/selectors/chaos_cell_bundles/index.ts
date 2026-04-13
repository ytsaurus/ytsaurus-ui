import filter_ from 'lodash/filter';
import find_ from 'lodash/find';
import map_ from 'lodash/map';
import uniq_ from 'lodash/uniq';

import {createSelector} from 'reselect';

import {concatByAnd} from '../../../common/hammer/predicate';
import type {RootState} from '../../../store/reducers';
import type {ChaosBundle, ChaosCell} from '../../../store/reducers/chaos_cell_bundles';
import {selectCluster} from '../../../store/selectors/global';
import {
    aggregateTotal,
    tabletActiveChaosBundleLink,
    tabletChaosBundleRootLink,
} from '../../../utils/components/tablet-cells';
import {prepareHost} from '../../../utils';
import {sortArrayBySortState} from '../../../utils/sort-helpers';
import {sortTableBundles} from '../../../utils/tablet_cell_bundles';

export const selectChaosIsLoaded = (state: RootState) => state.chaos_cell_bundles.loaded;
export const selectChaosIsLoading = (state: RootState) => state.chaos_cell_bundles.loading;
export const selectChaosError = (state: RootState) => state.chaos_cell_bundles.error;

export const selectChaosBundlesSortState = (state: RootState) =>
    state.chaos_cell_bundles.bundlesSort;

export const selectChaosBundlesNameFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesNameFilter;
export const selectChaosBundlesAccountFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesAccountFilter;
export const selectChaosBundlesTagNodeFilter = (state: RootState) =>
    state.chaos_cell_bundles.bundlesTagNodeFilter;

export const selectChaosBundles = (state: RootState) => state.chaos_cell_bundles.bundles;

export const selectChaosActiveBundle = (state: RootState) => state.chaos_cell_bundles.activeBundle;

export const selectChaosBundlesTableMode = (state: RootState) =>
    state.chaos_cell_bundles.bundlesTableMode;

export const selectChaosActiveBundleData = createSelector(
    [selectChaosBundles, selectChaosActiveBundle],
    (bundles, activeBundle) => {
        return find_(bundles, (item) => item.bundle === activeBundle);
    },
);

export const selectChaosBundlesTotal = createSelector(
    [selectChaosBundles],
    (bundles): ChaosBundle => aggregateTotal(bundles),
);

const COLUMNS_SORTABLE_AS_IS = new Set<keyof ChaosBundle>([
    'bundle',
    'health',
    'tabletCells',
    'tablets',
    'uncompressed',
    'compressed',
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

export const selectChaosBundlesFiltered = createSelector(
    [
        selectChaosBundles,
        selectChaosBundlesNameFilter,
        selectChaosBundlesAccountFilter,
        selectChaosBundlesTagNodeFilter,
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

export const selectChaosBundlesSorted = createSelector(
    [selectChaosBundlesFiltered, selectChaosBundlesSortState],
    (bundles, {column, order}) => {
        if (!column || !order) {
            return bundles;
        }

        return sortTableBundles({bundles, column, order, columnsSortable: COLUMNS_SORTABLE_AS_IS});
    },
);

export const selectChaosCells = (state: RootState) => state.chaos_cell_bundles.cells;
export const selectChaosCellsSortState = (state: RootState) => state.chaos_cell_bundles.cellsSort;

export const selectChaosCellsIdFilter = (state: RootState) =>
    state.chaos_cell_bundles.cellsIdFilter;
export const selectChaosCellsBundleFilter = (state: RootState) =>
    state.chaos_cell_bundles.cellsBundleFilter;
export const selectChaosCellsHostFilter = (state: RootState) =>
    state.chaos_cell_bundles.cellsHostFilter;

export const selectChaosCellsOfActiveAccount = createSelector(
    [selectChaosCells, selectChaosActiveBundle],
    (cells, activeBundle) => {
        if (!activeBundle) {
            return cells;
        }

        return filter_(cells, (item) => {
            return Boolean(item.bundle) && activeBundle === item.bundle;
        });
    },
);

export const selectChaosCellsFiltered = createSelector(
    [
        selectChaosCellsOfActiveAccount,
        selectChaosCellsIdFilter,
        selectChaosCellsBundleFilter,
        selectChaosCellsHostFilter,
        selectChaosActiveBundle,
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

export const selectChaosCellsSorted = createSelector(
    [selectChaosCellsFiltered, selectChaosCellsSortState],
    (cells, sortState) => {
        return sortArrayBySortState(cells, sortState);
    },
);

export const selectChaosCellsBundles = createSelector([selectChaosCells], (cells) => {
    return uniq_(map_(cells, 'bundle')).sort();
});

export const selectChaosCellsHosts = createSelector([selectChaosCellsOfActiveAccount], (cells) => {
    return uniq_(map_(cells, 'peerAddress')).sort();
});

export const selectChaosCellsHostsOfActiveBundle = createSelector(
    [selectChaosActiveBundle, selectChaosCellsFiltered],
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

export const selectChaosBreadcrumbItems = createSelector(
    [selectCluster, selectChaosActiveBundle],
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
