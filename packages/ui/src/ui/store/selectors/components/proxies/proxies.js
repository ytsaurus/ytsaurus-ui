import compact_ from 'lodash/compact';
import filter_ from 'lodash/filter';
import map_ from 'lodash/map';
import sumBy_ from 'lodash/sumBy';
import omit_ from 'lodash/omit';

import hammer from '../../../../common/hammer';
import {concatByAnd} from '../../../../common/hammer/predicate';
import {createSelector} from 'reselect';
import {proxiesTableColumnItems} from '../../../../utils/components/proxies/table';
import {COMPONENTS_PROXIES_TABLE_ID} from '../../../../constants/components/proxies/proxies';

const aggregateRoleItems = (proxies) => {
    const items = hammer.aggregation.countValues(proxies, 'role');

    return map_(items, (count, item) => ({
        text: item,
        value: item,
        count,
    }));
};

const aggregateStateItems = (proxies) => {
    const items = hammer.aggregation.countValues(proxies, 'state');

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

const selectProxies = (state) => state.components.proxies.proxies.proxies;

const selectHostFilter = (state) => state.components.proxies.proxies.hostFilter;

const selectStateFilter = (state) => state.components.proxies.proxies.stateFilter;

const selectRoleFilter = (state) => state.components.proxies.proxies.roleFilter;

const selectBannedFilter = (state) => state.components.proxies.proxies.bannedFilter;

const selectSortState = (state) => state.tables[COMPONENTS_PROXIES_TABLE_ID];

const selectFiltersObject = createSelector(
    [selectHostFilter, selectStateFilter, selectRoleFilter, selectBannedFilter],
    (hostFilter, stateFilter, roleFilter, bannedFilter) => {
        return {hostFilter, stateFilter, roleFilter, bannedFilter};
    },
);

const selectFilteredProxies = createSelector(
    [selectProxies, selectFiltersObject],
    (proxies, filtersObject) => {
        return filterProxies(proxies, filtersObject);
    },
);

function filterProxies(proxies, {hostFilter, stateFilter, roleFilter, bannedFilter}) {
    const bannedFilterAsBool = bannedFilter === 'true';
    const predicates = compact_([
        hostFilter ? ({host}) => host?.toLowerCase().includes(hostFilter) : undefined,
        stateFilter && stateFilter !== 'all' ? ({state}) => state === stateFilter : undefined,
        roleFilter && roleFilter !== 'all' ? ({role}) => role === roleFilter : undefined,
        bannedFilter !== 'all' ? ({banned}) => banned === bannedFilterAsBool : undefined,
    ]);
    return predicates.length ? filter_(proxies, concatByAnd(...predicates)) : proxies;
}

const selectAllRoles = createSelector([selectProxies], (proxy) => aggregateRoleItems(proxy));

const selectVisibleRoles = createSelector(
    [selectProxies, selectFiltersObject],
    (proxies, filtersObject) => {
        const filtered = filterProxies(proxies, omit_(filtersObject, ['roleFilter']));

        return aggregateRoleItems(filtered);
    },
);

const selectAllStates = createSelector([selectProxies], (proxy) => aggregateStateItems(proxy));

const selectVisibleStates = createSelector([selectProxies], (proxy) => aggregateStateItems(proxy));

export const selectVisibleProxies = createSelector(
    [selectFilteredProxies, selectSortState],
    (proxies, sortState) => hammer.utils.sort(proxies, sortState, proxiesTableColumnItems),
);

export const selectRoles = createSelector(
    [selectAllRoles, selectVisibleRoles, selectHostFilter, selectStateFilter],
    getSelectItems,
);

export const selectStates = createSelector(
    [selectAllStates, selectVisibleStates, selectHostFilter, selectRoleFilter],
    getSelectItems,
);
