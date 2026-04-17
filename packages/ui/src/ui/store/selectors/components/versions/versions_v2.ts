import filter_ from 'lodash/filter';
import isEmpty_ from 'lodash/isEmpty';
import reduce_ from 'lodash/reduce';
import sumBy_ from 'lodash/sumBy';

import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {detailsTableProps} from '../../../../pages/components/tabs/Versions/tables_v2';

import {COMPONENTS_VERSIONS_DETAILED_TABLE_ID} from '../../../../constants/components/versions/versions_v2';
import {RootState} from '../../../../store/reducers';
import {VersionHostInfo} from '../../../../store/reducers/components/versions/versions_v2';

const aggregateItems = (proxies: Array<VersionHostInfo>, key: keyof VersionHostInfo) => {
    const items = reduce_(
        proxies,
        (acc, item) => {
            const value = item[key];
            if (!acc.has(value)) {
                acc.set(value, 1);
            } else {
                const count = acc.get(value);
                acc.set(value, count + 1);
            }
            return acc;
        },
        new Map(),
    );

    return [...items.entries()].map(([item, count]) => {
        return {
            text: hammer.format['ReadableField'](String(item)),
            value: item,
            count,
        };
    });
};

function getSelectItems(
    allItems: ReturnType<typeof aggregateItems>,
    visibleItems: ReturnType<typeof aggregateItems>,
    hostFilter: string,
    otherFilters: Partial<ReturnType<typeof selectFilters>>,
) {
    const isAllSelected = isEmpty_(otherFilters);

    let items = allItems;

    if (hostFilter !== '' || !isAllSelected) {
        items = visibleItems;
    }

    const allItemsSection = {
        text: 'All',
        value: 'all',
        count: sumBy_(items, (item) => item.count),
    };

    return [allItemsSection, ...items];
}

const selectDetails = (state: RootState) => state.components.versionsV2.details;

const selectHostFilter = (state: RootState) => state.components.versionsV2.hostFilter;

const selectVersionFilter = (state: RootState) => state.components.versionsV2.versionFilter;

const selectTypeFilter = (state: RootState) => state.components.versionsV2.typeFilter;

const selectStateFilter = (state: RootState) => state.components.versionsV2.stateFilter;

const selectBannedFilter = (state: RootState) => state.components.versionsV2.bannedFilter;

const selectDetailsSortState = (state: RootState) =>
    state.tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

const selectFilteredByHost = createSelector(
    [selectDetails, selectHostFilter],
    (details, hostFilter) => {
        if (!hostFilter) {
            return details;
        }
        return filter_(details, ({address}) => address?.toLowerCase().includes(hostFilter));
    },
);

const selectFilters = createSelector(
    [selectVersionFilter, selectTypeFilter, selectStateFilter, selectBannedFilter],
    (version, type, state, banned) => {
        return reduce_(
            {
                version,
                type,
                state,
                banned,
            },
            (acc, value, k) => {
                if (value !== 'all') {
                    const key = k as keyof typeof acc;
                    acc[key] = value as any;
                }
                return acc;
            },
            {} as Partial<{
                version: typeof version;
                type: typeof version;
                state: typeof state;
                banned: typeof banned;
            }>,
        );
    },
);

const selectFiltersSkipVersion = createSelector([selectFilters], (filters) => {
    const {version: _x, ...rest} = filters;
    return rest;
});

const selectFiltersSkipType = createSelector([selectFilters], (filters) => {
    const {type: _x, ...rest} = filters;
    return rest;
});

const selectFiltersSkipState = createSelector([selectFilters], (filters) => {
    const {state: _x, ...rest} = filters;
    return rest;
});

const selectFiltersSkipBanned = createSelector([selectFilters], (filters) => {
    const {banned: _x, ...rest} = filters;
    return rest;
});

const selectFilteredDetails = createSelector(
    [selectFilteredByHost, selectFilters],
    (data, filters) => {
        return filter_(data, filters) as Array<VersionHostInfo>;
    },
);

export const selectVisibleDetails = createSelector(
    [selectFilteredDetails, selectDetailsSortState],
    (details, sortState): typeof details =>
        hammer.utils.sort(details, sortState, detailsTableProps.columns.items),
);

const selectAllVersions = createSelector([selectDetails], (versions) =>
    aggregateItems(versions, 'version'),
);

const selectAllTypes = createSelector([selectDetails], (versions) =>
    aggregateItems(versions, 'type'),
);

const selectAllStates = createSelector([selectDetails], (versions) =>
    aggregateItems(versions, 'state'),
);

const selectAllBanned = createSelector([selectDetails], (version) =>
    aggregateItems(version, 'banned'),
);

const selectVisibleVersions = createSelector(
    [selectFilteredByHost, selectFiltersSkipVersion],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'version');
    },
);

const selectVisibleTypes = createSelector(
    [selectFilteredByHost, selectFiltersSkipType],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'type');
    },
);

const selectVisibleStates = createSelector(
    [selectFilteredByHost, selectFiltersSkipState],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'state');
    },
);

const selectVisibleBanned = createSelector(
    [selectFilteredByHost, selectFiltersSkipBanned],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'banned');
    },
);

export const selectVersionSelectItems = createSelector(
    [selectAllVersions, selectVisibleVersions, selectHostFilter, selectFiltersSkipVersion],
    getSelectItems,
);

export const selectTypeSelectItems = createSelector(
    [selectAllTypes, selectVisibleTypes, selectHostFilter, selectFiltersSkipType],
    getSelectItems,
);

export const selectStatesSelectItems = createSelector(
    [selectAllStates, selectVisibleStates, selectHostFilter, selectFiltersSkipState],
    getSelectItems,
);

export const selectBannedSelectItems = createSelector(
    [selectAllBanned, selectVisibleBanned, selectHostFilter, selectFiltersSkipBanned],
    getSelectItems,
);
