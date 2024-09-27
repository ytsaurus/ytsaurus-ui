import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import sumBy_ from 'lodash/sumBy';

import hammer from '../../../../common/hammer';
import {concatByAnd} from '../../../../common/hammer/predicate';
import {createSelector} from 'reselect';
import {proxiesTableColumnItems} from '../../../../utils/components/proxies/table';
import {COMPONENTS_PROXIES_TABLE_ID} from '../../../../constants/components/proxies/proxies';

const aggregateItems = (proxies, key) => {
    const items = hammer.aggregation.countValues(proxies, key);

    return map_(items, (count, item) => ({
        text: hammer.format['FirstUppercase'](item),
        value: item,
        count,
    }));
};

const getSelectItems = (allItems, visibleItems, hostFilter, selectFilter) => {
    let items = allItems;

    if (hostFilter !== '' || selectFilter !== 'all') {
        items = visibleItems;
    }

    const allItemsSection = {
        text: 'All',
        value: 'all',
        count: sumBy_(items, (item) => item.count),
    };

    return [allItemsSection, ...items];
};

const getProxies = (state) => state.components.proxies.proxies.proxies;
const getHostFilter = (state) => state.components.proxies.proxies.hostFilter;
const getStateFilter = (state) => state.components.proxies.proxies.stateFilter;
const getRoleFilter = (state) => state.components.proxies.proxies.roleFilter;
const getBannedFilter = (state) => state.components.proxies.proxies.bannedFilter;
const getSortState = (state) => state.tables[COMPONENTS_PROXIES_TABLE_ID];

const getFiltersObject = createSelector(
    [getHostFilter, getStateFilter, getRoleFilter, getBannedFilter],
    (hostFilter, stateFilter, roleFilter, bannedFilter) => {
        return {hostFilter, stateFilter, roleFilter, bannedFilter};
    },
);

const getFilteredProxies = createSelector(
    [getProxies, getFiltersObject],
    (proxies, filtersObject) => {
        return filterProxies(proxies, filtersObject);
    },
);

function filterProxies(proxies, {hostFilter, stateFilter, roleFilter, bannedFilter}) {
    const bannedFilterAsBool = bannedFilter === 'true';
    const predicates = compact_([
        hostFilter ? ({host}) => host?.toLowerCase().startsWith(hostFilter) : undefined,
        stateFilter && stateFilter !== 'all' ? ({state}) => state === stateFilter : undefined,
        roleFilter && roleFilter !== 'all' ? ({role}) => role === roleFilter : undefined,
        bannedFilter !== 'all' ? ({banned}) => banned === bannedFilterAsBool : undefined,
    ]);
    return predicates.length ? filter_(proxies, concatByAnd(...predicates)) : proxies;
}

const getAllRoles = createSelector([getProxies], (proxy) => aggregateItems(proxy, 'role'));

const getVisibleRoles = createSelector(
    [getProxies, getFiltersObject],
    function (
        proxies,
        {
            // eslint-disable-next-line no-unused-vars
            roleFilter,
            ...rest
        },
    ) {
        const filtered = filterProxies(proxies, rest);
        return aggregateItems(filtered, 'role');
    },
);

const getAllStates = createSelector([getProxies], (proxy) => aggregateItems(proxy, 'state'));

const getVisibleStates = createSelector([getProxies], (proxy) => aggregateItems(proxy, 'state'));

export const getVisibleProxies = createSelector(
    [getFilteredProxies, getSortState],
    (proxies, sortState) => hammer.utils.sort(proxies, sortState, proxiesTableColumnItems),
);

export const getRoles = createSelector(
    [getAllRoles, getVisibleRoles, getHostFilter, getStateFilter],
    getSelectItems,
);

export const getStates = createSelector(
    [getAllStates, getVisibleStates, getHostFilter, getRoleFilter],
    getSelectItems,
);
