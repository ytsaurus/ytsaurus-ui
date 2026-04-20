import {createSelector} from 'reselect';
import {
    getClusterConfigByName,
    selectAllPoolNames,
    selectAllPoolTreeNames,
    selectAllUserNames,
    selectCluster,
    selectCurrentUserName,
} from '../../../store/selectors/global';

import concat_ from 'lodash/concat';
import filter_ from 'lodash/filter';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import some_ from 'lodash/some';
import sortBy_ from 'lodash/sortBy';

import {type RootState} from '../../reducers';
import {type OperationsListFilterValue} from '../../reducers/operations/list/list';

export const selectOperationsListFilters = (state: RootState) => state.operations.list.filters;
export const selectOperationsPoolFilterData = (state: RootState) =>
    selectOperationsListFilters(state)['pool'];
export const selectOperationsUserFilterData = (state: RootState) =>
    selectOperationsListFilters(state)['user'];
export const selectOperationsPoolTreeRawCounters = (state: RootState) =>
    state.operations.list.filters.poolTree.counters?.pool_tree_counts || {};
export const selectOperationsPoolRawCounters = (state: RootState) =>
    selectOperationsPoolFilterData(state).counters?.pool_counts || {};
export const selectOperationsUserRawCounter = (state: RootState) =>
    selectOperationsUserFilterData(state).counters?.user_counts || {};

export const selectOperationsPoolTreeCountersItems = createSelector(
    [selectOperationsPoolTreeRawCounters],
    convertCountersToItems,
);

export const selectOperationsPoolTreeItemsWithoutCounter = createSelector(
    [selectAllPoolTreeNames, selectOperationsPoolTreeRawCounters],
    (f, s) => {
        return calculateItemsWithoutCounter(f, s);
    },
);

export const selectOperationsPoolTreeSuggestions = createSelector(
    [selectOperationsPoolTreeCountersItems, selectOperationsPoolTreeItemsWithoutCounter],
    concat_,
);

export const selectOperationsPoolCountersItems = createSelector(
    [selectOperationsPoolRawCounters],
    convertCountersToItems,
);

export const selectOperationsPoolItemsWithoutCounter = createSelector(
    [selectAllPoolNames, selectOperationsPoolRawCounters],
    calculateItemsWithoutCounter,
);

export const selectOperationsPoolSuggestions = createSelector(
    [selectOperationsPoolCountersItems, selectOperationsPoolItemsWithoutCounter],
    concat_,
);

export const selectOperationsUserCountersItems = createSelector(
    [selectOperationsUserRawCounter],
    convertCountersToItems,
);

export const selectOperationsUserItemsWithoutCounter = createSelector(
    [selectAllUserNames, selectOperationsUserRawCounter],
    calculateItemsWithoutCounter,
);

export const selectOperationsUserSuggestions = createSelector(
    [selectOperationsUserCountersItems, selectOperationsUserItemsWithoutCounter],
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
    {
        value: 'withInterruptionInfo' as const,
        text: 'With interruption info',
    },
];
export const ATTRIBUTE_ITEM_NAMES = map_(ATTRIBUTE_ITEMS, ({value}) => value);

export const selectOperationsListFilterParameters = createSelector(
    [selectOperationsListFilters],
    (filters) => {
        const {text, user, subject, permissions, pool, poolTree, state, type, failedJobs} = filters;

        const actualSubject = selectValueIfNotDefault(subject);
        const actualPermissions = selectValueIfNotDefault(permissions) as string;
        const access =
            actualSubject || actualPermissions?.length > 0
                ? {subject: actualSubject, permissions: actualPermissions || []}
                : undefined;

        const res = {
            filter: selectValueIfNotDefault(text),
            user: selectValueIfNotDefault(user),
            pool: selectValueIfNotDefault(pool),
            pool_tree: selectValueIfNotDefault(poolTree),
            type: selectValueIfNotDefault(type),
            with_failed_jobs: selectValueIfNotDefault(failedJobs),
            access,
        };
        return {
            state: selectValueIfNotDefault(state),
            ...res,
        };
    },
);

export function selectOperationsListTimeRange(state: RootState) {
    const {from, to} = state.operations.list.timeRange;

    return {
        to_time: to,
        from_time: from,
    };
}

export const selectOperationsListFiltersParameters_FOR_YTFRONT_2838 = createSelector(
    [
        selectOperationsListFilterParameters,
        selectCurrentUserName,
        selectOperationsListTimeRange,
        selectCluster,
    ],
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

export const selectOperationsListFixedStartedByFilter_FOR_YTFRONT_2838 = createSelector(
    [selectOperationsListFilterParameters, selectOperationsListFiltersParameters_FOR_YTFRONT_2838],
    (filters, fixedFilters) => {
        if (isEqual_(filters, fixedFilters)) {
            return undefined;
        }
        return fixedFilters.user;
    },
);

export function selectValueIfNotDefault(filter: OperationsListFilterValue) {
    return filter.value === filter.defaultValue ? undefined : filter.value;
}
