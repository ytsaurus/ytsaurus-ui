import {createSelector} from 'reselect';
import {
    getAllPoolNames,
    getAllPoolTreeNames,
    getAllUserNames,
    getCluster,
    getClusterConfigByName,
    getCurrentUserName,
} from '../../../store/selectors/global';

import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import some_ from 'lodash/some';
import sortBy_ from 'lodash/sortBy';

import {RootState} from '../../reducers';
import {OperationsListFilterValue} from '../../reducers/operations/list/list';

export const getOperationsListFilters = (state: RootState) => state.operations.list.filters;
export const getOperationsPoolFilterData = (state: RootState) =>
    getOperationsListFilters(state)['pool'];
export const getOperationsUserFilterData = (state: RootState) =>
    getOperationsListFilters(state)['user'];
export const getOperationsPoolTreeRawCounters = (state: RootState) =>
    state.operations.list.filters.poolTree.counters?.pool_tree_counts || {};
export const getOperationsPoolRawCounters = (state: RootState) =>
    getOperationsPoolFilterData(state).counters?.pool_counts || {};
export const getOperationsUserRawCounter = (state: RootState) =>
    getOperationsUserFilterData(state).counters?.user_counts || {};

export const getOperationsPoolTreeCountersItems = createSelector(
    [getOperationsPoolTreeRawCounters],
    convertCountersToItems,
);

export const getOperationsPoolTreeItemsWithoutCounter = createSelector(
    [getAllPoolTreeNames, getOperationsPoolTreeRawCounters],
    (f, s) => {
        return calculateItemsWithoutCounter(f, s);
    },
);

export const getOperationsPoolTreeSuggestions = createSelector(
    [getOperationsPoolTreeCountersItems, getOperationsPoolTreeItemsWithoutCounter],
    concat_,
);

export const getOperationsPoolCountersItems = createSelector(
    [getOperationsPoolRawCounters],
    convertCountersToItems,
);

export const getOperationsPoolItemsWithoutCounter = createSelector(
    [getAllPoolNames, getOperationsPoolRawCounters],
    calculateItemsWithoutCounter,
);

export const getOperationsPoolSuggestions = createSelector(
    [getOperationsPoolCountersItems, getOperationsPoolItemsWithoutCounter],
    concat_,
);

export const getOperationsUserCountersItems = createSelector(
    [getOperationsUserRawCounter],
    convertCountersToItems,
);

export const getOperationsUserItemsWithoutCounter = createSelector(
    [getAllUserNames, getOperationsUserRawCounter],
    calculateItemsWithoutCounter,
);

export const getOperationsUserSuggestions = createSelector(
    [getOperationsUserCountersItems, getOperationsUserItemsWithoutCounter],
    concat_,
);

function convertCountersToItems(counters: Record<string, number>) {
    return sortBy_(
        map_(counters, (count, pool) => ({
            value: pool,
            text: pool,
            counter: count,
        })),
        'text',
    );
}

function calculateItemsWithoutCounter(
    allNames: Array<string>,
    countersMap: Record<string, number>,
) {
    return sortBy_(
        map_(
            filter_(allNames, (name) => countersMap[name] === undefined),
            (name) => ({value: name, text: name}),
        ),
        'text',
    );
}

export const ATTRIBUTE_ITEMS = [
    {
        value: 'withStderr' as const,
        text: 'With stderr',
    },
    {
        value: 'withFailContext' as const,
        text: 'With fail context',
    },
    {
        value: 'withSpec' as const,
        text: 'With full input',
    },
    {
        value: 'withCompetitors' as const,
        text: 'With competitive jobs',
    },
    {
        value: 'withMonitoringDescriptor' as const,
        text: 'With monitoring descriptor',
    },
];
export const ATTRIBUTE_ITEM_NAMES = map_(ATTRIBUTE_ITEMS, ({value}) => value);

export const getOperationsListFilterParameters = createSelector(
    [getOperationsListFilters],
    (filters) => {
        const {text, user, subject, permissions, pool, poolTree, state, type, failedJobs} = filters;

        const actualSubject = getValueIfNotDefault(subject);
        const actualPermissions = getValueIfNotDefault(permissions) as string;
        const access =
            actualSubject || actualPermissions?.length > 0
                ? {subject: actualSubject, permissions: actualPermissions || []}
                : undefined;

        const res = {
            filter: getValueIfNotDefault(text),
            user: getValueIfNotDefault(user),
            pool: getValueIfNotDefault(pool),
            pool_tree: getValueIfNotDefault(poolTree),
            type: getValueIfNotDefault(type),
            with_failed_jobs: getValueIfNotDefault(failedJobs),
            access,
        };
        return {
            state: getValueIfNotDefault(state),
            ...res,
        };
    },
);

export function getOperationsListTimeRange(state: RootState) {
    const {from, to} = state.operations.list.timeRange;

    return {
        to_time: to,
        from_time: from,
    };
}

export const getOperationsListFiltersParameters_FOR_YTFRONT_2838 = createSelector(
    [getOperationsListFilterParameters, getCurrentUserName, getOperationsListTimeRange, getCluster],
    (filters, login, {from_time, to_time}, cluster) => {
        const clusterConfig = getClusterConfigByName(cluster);

        if (clusterConfig.operationPageSettings?.disableOptimizationForYTFRONT2838) {
            return filters;
        }

        const {state, ...rest} = filters;
        if (Boolean(from_time || to_time) && !some_(rest, Boolean)) {
            rest.user = login;
        }
        return {
            state,
            ...rest,
        };
    },
);

export const getOperationsListFixedStartedByFilter_FOR_YTFRONT_2838 = createSelector(
    [getOperationsListFilterParameters, getOperationsListFiltersParameters_FOR_YTFRONT_2838],
    (filters, fixedFilters) => {
        if (isEqual_(filters, fixedFilters)) {
            return undefined;
        }
        return fixedFilters.user;
    },
);

export function getValueIfNotDefault(filter: OperationsListFilterValue) {
    return filter.value === filter.defaultValue ? undefined : filter.value;
}
