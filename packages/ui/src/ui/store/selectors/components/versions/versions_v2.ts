import filter_ from 'lodash/filter';
import isEmpty_ from 'lodash/isEmpty';
import reduce_ from 'lodash/reduce';
import sumBy_ from 'lodash/sumBy';

import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {detailsTableProps} from '../../../../utils/components/versions/tables_v2';

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
    otherFilters: Partial<ReturnType<typeof getFilters>>,
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

const getDetails = (state: RootState) => state.components.versionsV2.details;

const getHostFilter = (state: RootState) => state.components.versionsV2.hostFilter;
const getVersionFilter = (state: RootState) => state.components.versionsV2.versionFilter;
const getTypeFilter = (state: RootState) => state.components.versionsV2.typeFilter;
const getStateFilter = (state: RootState) => state.components.versionsV2.stateFilter;
const getBannedFilter = (state: RootState) => state.components.versionsV2.bannedFilter;

const getDetailsSortState = (state: RootState) =>
    state.tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

const getFilteredByHost = createSelector([getDetails, getHostFilter], (details, hostFilter) => {
    if (!hostFilter) {
        return details;
    }
    return filter_(details, ({address}) => address?.toLowerCase().startsWith(hostFilter));
});

const getFilters = createSelector(
    [getVersionFilter, getTypeFilter, getStateFilter, getBannedFilter],
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

const getFiltersSkipVersion = createSelector([getFilters], (filters) => {
    const {version: _x, ...rest} = filters;
    return rest;
});

const getFiltersSkipType = createSelector([getFilters], (filters) => {
    const {type: _x, ...rest} = filters;
    return rest;
});

const getFiltersSkipState = createSelector([getFilters], (filters) => {
    const {state: _x, ...rest} = filters;
    return rest;
});

const getFiltersSkipBanned = createSelector([getFilters], (filters) => {
    const {banned: _x, ...rest} = filters;
    return rest;
});

const getFilteredDetails = createSelector([getFilteredByHost, getFilters], (data, filters) => {
    return filter_(data, filters) as Array<VersionHostInfo>;
});

export const getVisibleDetails = createSelector(
    [getFilteredDetails, getDetailsSortState],
    (details, sortState): typeof details =>
        hammer.utils.sort(details, sortState, detailsTableProps.columns.items),
);

const getAllVersions = createSelector([getDetails], (versions) =>
    aggregateItems(versions, 'version'),
);
const getAllTypes = createSelector([getDetails], (versions) => aggregateItems(versions, 'type'));
const getAllStates = createSelector([getDetails], (versions) => aggregateItems(versions, 'state'));

const getAllBanned = createSelector([getDetails], (version) => aggregateItems(version, 'banned'));

const getVisibleVersions = createSelector(
    [getFilteredByHost, getFiltersSkipVersion],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'version');
    },
);
const getVisibleTypes = createSelector([getFilteredByHost, getFiltersSkipType], (data, filters) => {
    const items = filter_(data, filters) as Array<VersionHostInfo>;
    return aggregateItems(items, 'type');
});
const getVisibleStates = createSelector(
    [getFilteredByHost, getFiltersSkipState],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'state');
    },
);

const getVisibleBanned = createSelector(
    [getFilteredByHost, getFiltersSkipBanned],
    (data, filters) => {
        const items = filter_(data, filters) as Array<VersionHostInfo>;
        return aggregateItems(items, 'banned');
    },
);

export const getVersionSelectItems = createSelector(
    [getAllVersions, getVisibleVersions, getHostFilter, getFiltersSkipVersion],
    getSelectItems,
);
export const getTypeSelectItems = createSelector(
    [getAllTypes, getVisibleTypes, getHostFilter, getFiltersSkipType],
    getSelectItems,
);
export const getStatesSelectItems = createSelector(
    [getAllStates, getVisibleStates, getHostFilter, getFiltersSkipState],
    getSelectItems,
);

export const getBannedSelectItems = createSelector(
    [getAllBanned, getVisibleBanned, getHostFilter, getFiltersSkipBanned],
    getSelectItems,
);
