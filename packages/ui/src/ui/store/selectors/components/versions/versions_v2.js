import _ from 'lodash';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {detailsTableProps} from '../../../../utils/components/versions/tables_v2';

import {COMPONENTS_VERSIONS_DETAILED_TABLE_ID} from '../../../../constants/components/versions/versions_v2';

const aggregateItems = (proxies, key) => {
    const items = _.reduce(
        proxies,
        (acc, {[key]: value} = {}) => {
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

const getSelectItems = (allItems, visibleItems, hostFilter, otherFilters) => {
    const isAllSelected = _.isEmpty(otherFilters);

    let items = allItems;

    if (hostFilter !== '' || !isAllSelected) {
        items = visibleItems;
    }

    const allItemsSection = {
        text: 'All',
        value: 'all',
        count: _.sumBy(items, (item) => item.count),
    };

    return [allItemsSection, ...items];
};

const getDetails = (state) => state.components.versionsV2.details;

const getHostFilter = (state) => state.components.versionsV2.hostFilter;
const getVersionFilter = (state) => state.components.versionsV2.versionFilter;
const getTypeFilter = (state) => state.components.versionsV2.typeFilter;
const getStateFilter = (state) => state.components.versionsV2.stateFilter;
const getBannedFilter = (state) => state.components.versionsV2.bannedFilter;

const getDetailsSortState = (state) => state.tables[COMPONENTS_VERSIONS_DETAILED_TABLE_ID];

const getFilteredByHost = createSelector([getDetails, getHostFilter], (details, hostFilter) => {
    if (!hostFilter) {
        return details;
    }
    return _.filter(details, ({address}) => address?.toLowerCase().startsWith(hostFilter));
});

const getFilters = createSelector(
    [getVersionFilter, getTypeFilter, getStateFilter, getBannedFilter],
    (version, type, state, banned) => {
        return _.reduce(
            {
                version,
                type,
                state,
                banned,
            },
            (acc, value, key) => {
                if (value !== 'all') {
                    acc[key] = value;
                }
                return acc;
            },
            {},
        );
    },
);

const getFiltersSkipVersion = createSelector([getFilters], (filters) => {
    // eslint-disable-next-line no-unused-vars
    const {version, ...rest} = filters;
    return rest;
});

const getFiltersSkipType = createSelector([getFilters], (filters) => {
    // eslint-disable-next-line no-unused-vars
    const {type, ...rest} = filters;
    return rest;
});

const getFiltersSkipState = createSelector([getFilters], (filters) => {
    // eslint-disable-next-line no-unused-vars
    const {state, ...rest} = filters;
    return rest;
});

const getFiltersSkipBanned = createSelector([getFilters], (filters) => {
    // eslint-disable-next-line no-unused-vars
    const {banned, ...rest} = filters;
    return rest;
});

const getFilteredDetails = createSelector([getFilteredByHost, getFilters], (data, filters) => {
    return _.filter(data, filters);
});

export const getVisibleDetails = createSelector(
    [getFilteredDetails, getDetailsSortState],
    (details, sortState) => hammer.utils.sort(details, sortState, detailsTableProps.columns.items),
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
        return aggregateItems(_.filter(data, filters), 'version');
    },
);
const getVisibleTypes = createSelector([getFilteredByHost, getFiltersSkipType], (data, filters) => {
    return aggregateItems(_.filter(data, filters), 'type');
});
const getVisibleStates = createSelector(
    [getFilteredByHost, getFiltersSkipState],
    (data, filters) => {
        return aggregateItems(_.filter(data, filters), 'state');
    },
);

const getVisibleBanned = createSelector(
    [getFilteredByHost, getFiltersSkipBanned],
    (data, filters) => {
        return aggregateItems(_.filter(data, filters), 'banned');
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
