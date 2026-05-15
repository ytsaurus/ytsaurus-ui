import isEmpty_ from 'lodash/isEmpty';
import isEqual_ from 'lodash/isEqual';

import {type RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {selectCluster} from '../../../../store/selectors/global';
import {selectPath} from '../../../../store/selectors/navigation/index';
import {convertTimeToRequestParams} from '../../../../components/common/Timeline';

const selectAccessLogFiltersState = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters;

export const selectAccessLogFilterRecursive = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.recursive;

export const selectAccessLogFilterPagination = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.pagination;

export const selectAccessLogFilterPathRegex = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.path_regex;

export const selectAccessLogFilterUserRegex = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.user_regex;

export const selectAccessLogFilterMethod = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.method_group;

export const selectAccessLogFilterUserType = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.user_type;

export const selectAccessLogFilterScope = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.scope;

export const selectAccessLogFilterTime = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.time;

export const selectAccessLogFilterFieldSelector = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.field_selector;

export const selectAccessLogFilterMetadata = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.metadata;

export const selectAccessLogFilterDistinctBy = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.distinct_by;

export const selectAccessLogLoading = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.loading;

export const selectAccessLogReady = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.ready;

export const selectAccessLogLoaded = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.loaded;

export const selectAccessLogError = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.error;

export const selectAccessLogItems = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.accesses;

export const selectAccessLogTotalRowCount = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.total_row_count;

export const selectAccessLogAvailableTimeRange = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.availableTimeRange;

export const selectAccessLogPagesCount = createSelector(
    [selectAccessLogTotalRowCount, (state) => selectAccessLogFilterPagination(state).size],
    (totalRowCount, size) => {
        return Math.ceil(totalRowCount / size);
    },
);

export const selectAccessLogLastLoadedParams = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.params;

function skipEmpty<T>(v: T) {
    return isEmpty_(v) ? undefined : v;
}

export const selectAccessLogRequestParams = createSelector(
    [selectCluster, selectPath, selectAccessLogFiltersState],
    (cluster, path, filters) => {
        const {time, field_selector, method_group, user_type, scope, ...rest} = filters;

        const {from, to} = convertTimeToRequestParams(time) || {};
        return {
            ...rest,
            begin: from === undefined ? undefined : from / 1000,
            end: to === undefined ? undefined : to / 1000,
            cluster,
            path,
            field_selector: skipEmpty(field_selector),
            method_group: skipEmpty(method_group),
            user_type: skipEmpty(user_type),
            scope: skipEmpty(scope),
        };
    },
);

export const selectAccessLogHasChangedFilters = createSelector(
    [selectAccessLogLastLoadedParams, selectAccessLogRequestParams],
    (lastLoaded, current) => {
        return Boolean(lastLoaded.path) && !isEqual_(lastLoaded, current);
    },
);

export const selectAccessLogLastLoadedFieldSelector = createSelector(
    [selectAccessLogLastLoadedParams],
    (params) => {
        return params.field_selector;
    },
);
