import _ from 'lodash';
import produce from 'immer';
import {initialState} from './access-log-filters';
import {RootState} from '../../../../../store/reducers/index';
import {updateIfChanged} from '../../../../../utils/utils';
import {
    makeTimeRangeMsToSecondsSerialization,
    parseSerializeBoolean,
} from '../../../../../utils/parse-serialize';

export const navigationAccessLogParams = {
    alPage: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.pagination.index',
        initialState: initialState.pagination.index,
        options: {parse: Number},
    },
    alPath: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.path_regex',
        initialState: initialState.path_regex,
    },
    alUser: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.user_regex',
        initialState: initialState.user_regex,
    },
    alMethod: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.method_group',
        initialState: initialState.method_group,
        type: 'object',
        options: {isFlags: true},
    },
    alTime: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.time',
        initialState: initialState.time,
        options: makeTimeRangeMsToSecondsSerialization(initialState.time),
    },
    alScope: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.scope',
        initialState: initialState.scope,
        type: 'object',
        options: {isFlags: true},
    },
    alUserType: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.user_type',
        initialState: initialState.user_type,
        type: 'object',
        options: {isFlags: true},
    },

    alColumns: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.field_selector',
        initialState: initialState.field_selector,
        type: 'object',
        options: {isFlags: true},
    },

    alAttrs: {
        stateKey: 'navigation.tabs.accessLog.accessLogFilters.metadata',
        initialState: initialState.metadata,
        options: {
            ...parseSerializeBoolean,
        },
    },
};

type LocationType = {query: RootState};

export function getNavigationAccessLogPreparedState(state: RootState, {query}: LocationType) {
    return produce(state, (draft) => {
        const {
            navigation: {
                tabs: {
                    accessLog: {accessLogFilters},
                },
            },
        } = draft || {};
        const {
            navigation: {
                tabs: {
                    accessLog: {accessLogFilters: queryFilters},
                },
            },
        } = query;

        updateIfChanged(accessLogFilters.pagination, 'index', queryFilters.pagination.index);
        updateIfChanged(accessLogFilters, 'path_regex', queryFilters.path_regex);
        updateIfChanged(accessLogFilters, 'user_regex', queryFilters.user_regex);
        updateIfChanged(accessLogFilters, 'method_group', queryFilters.method_group);
        updateIfChanged(accessLogFilters, 'time', queryFilters.time, _.isEqual);
        updateIfChanged(accessLogFilters, 'scope', queryFilters.scope, _.isEqual);
        updateIfChanged(accessLogFilters, 'user_type', queryFilters.user_type, _.isEqual);
        updateIfChanged(accessLogFilters, 'field_selector', queryFilters.field_selector, _.isEqual);
        updateIfChanged(accessLogFilters, 'metadata', queryFilters.metadata);
    });
}
