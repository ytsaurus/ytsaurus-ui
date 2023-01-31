import _ from 'lodash';

import {RootState} from '../../../../store/reducers';
import {createSelector} from 'reselect';
import {getCluster} from '../../../../store/selectors/global';
import {getPath} from '../../../../store/selectors/navigation/index';
import {convertTimeToRequestParams} from '../../../../components/common/Timeline';

const getAccessLogFiltersState = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters;

export const getAccessLogFilterPagination = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.pagination;

export const getAccessLogFilterPathRegex = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.path_regex;

export const getAccessLogFilterUserRegex = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.user_regex;

export const getAccessLogFilterMethod = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.method_group;

export const getAccessLogFilterUserType = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.user_type;

export const getAccessLogFilterScope = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.scope;

export const getAccessLogFilterTime = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.time;

export const getAccessLogFilterFieldSelector = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.field_selector;

export const getAccessLogFilterMetadata = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.metadata;

export const getAccessLogFilterDistinctBy = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLogFilters.distinct_by;

export const getAccessLogLoading = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.loading;

export const getAccessLogReady = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.ready;

export const getAccessLogLoaded = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.loaded;

export const getAccessLogError = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.error;

export const getAccessLogItems = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.accesses;

export const getAccessLogTotalRowCount = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.total_row_count;

export const getAccessLogAvailableTimeRange = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.availableTimeRange;

export const getAccessLogPagesCount = createSelector(
    [getAccessLogTotalRowCount, (state) => getAccessLogFilterPagination(state).size],
    (totalRowCount, size) => {
        return Math.ceil(totalRowCount / size);
    },
);

export const getAccessLogLastLoadedParams = (state: RootState) =>
    state.navigation.tabs.accessLog.accessLog.params;

function skipEmpty<T>(v: T) {
    return _.isEmpty(v) ? undefined : v;
}

export const getAccessLogRequestParams = createSelector(
    [getCluster, getPath, getAccessLogFiltersState],
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

export const getAccessLogHasChangedFilters = createSelector(
    [getAccessLogLastLoadedParams, getAccessLogRequestParams],
    (lastLoaded, current) => {
        return Boolean(lastLoaded.path) && !_.isEqual(lastLoaded, current);
    },
);

export const getAccessLogLastLoadedFieldSelector = createSelector(
    [getAccessLogLastLoadedParams],
    (params) => {
        return params.field_selector;
    },
);
