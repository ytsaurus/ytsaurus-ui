import _ from 'lodash';
import hammer from '../../../../common/hammer';
import {createSelector} from 'reselect';
import {proxiesTableColumnItems} from '../../../../utils/components/proxies/table';
import {COMPONENTS_PROXIES_TABLE_ID} from '../../../../constants/components/proxies/proxies';

const isCorrectHost = ({host}, filterHost) => host?.toLowerCase().startsWith(filterHost);
const isCorrectState = ({state}, filterState) => {
    if (filterState === 'all') {
        return true;
    }

    return state === filterState;
};

const isCorrectRole = ({role}, filterRole) => {
    if (filterRole === 'all') {
        return true;
    }

    return role === filterRole;
};

const aggregateItems = (proxies, key) => {
    const items = hammer.aggregation.countValues(proxies, key);

    return _.map(items, (count, item) => ({
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
        count: _.sumBy(items, (item) => item.count),
    };

    return [allItemsSection, ...items];
};

const getProxies = (state) => state.components.proxies.proxies.proxies;
const getHostFilter = (state) => state.components.proxies.proxies.hostFilter;
const getStateFilter = (state) => state.components.proxies.proxies.stateFilter;
const getRoleFilter = (state) => state.components.proxies.proxies.roleFilter;
const getSortState = (state) => state.tables[COMPONENTS_PROXIES_TABLE_ID];

const getFilteredByHost = createSelector([getProxies, getHostFilter], (proxies, hostFilter) =>
    _.filter(proxies, (proxy) => isCorrectHost(proxy, hostFilter)),
);

const getFilteredByState = createSelector(
    [getFilteredByHost, getStateFilter],
    (proxies, stateFilter) => _.filter(proxies, (proxy) => isCorrectState(proxy, stateFilter)),
);

const getFilteredByRole = createSelector(
    [getFilteredByHost, getRoleFilter],
    (proxies, roleFilter) => _.filter(proxies, (proxy) => isCorrectRole(proxy, roleFilter)),
);

const getFilteredProxies = createSelector(
    [getFilteredByHost, getFilteredByState, getFilteredByRole],
    (filteredByHost, filteredByState, filteredByRole) =>
        _.intersection(filteredByHost, filteredByState, filteredByRole),
);

const getAllRoles = createSelector([getProxies], (proxy) => aggregateItems(proxy, 'role'));

const getVisibleRoles = createSelector([getFilteredByState], (proxy) =>
    aggregateItems(proxy, 'role'),
);

const getAllStates = createSelector([getProxies], (proxy) => aggregateItems(proxy, 'state'));

const getVisibleStates = createSelector([getFilteredByRole], (proxy) =>
    aggregateItems(proxy, 'state'),
);

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
