import _ from 'lodash';
import moment from 'moment';
import {RootState} from '../../../../store/reducers';
import {produce} from 'immer';

import {initialState as listInitialState} from '../../../../store/reducers/operations/list/list';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';
import {FIX_MY_TYPE} from '../../../../types';

const {text, user, subject, permissions, pool, state, type, failedJobs} = listInitialState.filters;
const {
    dataMode: initialDataMode,
    timeRange: {from: initialTimeRangeFrom, to: initialTimeRangeTo},
    cursor: {from: initialCursor, direction: initialCursorDirection},
} = listInitialState;

const initialTextFilter = text.defaultValue;
const initialUserFilter = user.defaultValue;
const initialSubjectFilter = subject.defaultValue;
const initialPermissionsFilter = permissions.defaultValue;
const initialPoolFilter = pool.defaultValue;
const initialStateFilter = state.defaultValue;
const initialTypeFilter = type.defaultValue;
const initialFailedJobsFilter = failedJobs.defaultValue;

function dateStringToUnix(dateString: string) {
    return moment(dateString).unix();
}

function dateUnixToString(dateUnix: string) {
    return moment.unix(dateUnix as FIX_MY_TYPE).toISOString();
}

export const listParams: LocationParameters = {
    filter: {
        stateKey: 'operations.list.filters.text.value',
        initialState: initialTextFilter,
    },
    user: {
        stateKey: 'operations.list.filters.user.value',
        initialState: initialUserFilter,
    },
    subject: {
        stateKey: 'operations.list.filters.subject.value',
        initialState: initialSubjectFilter,
    },
    permissions: {
        stateKey: 'operations.list.filters.permissions.value',
        initialState: initialPermissionsFilter,
        type: 'array',
    },
    pool: {
        stateKey: 'operations.list.filters.pool.value',
        initialState: initialPoolFilter,
    },
    state: {
        stateKey: 'operations.list.filters.state.value',
        initialState: initialStateFilter,
    },
    type: {
        stateKey: 'operations.list.filters.type.value',
        initialState: initialTypeFilter,
    },
    failedJobs: {
        stateKey: 'operations.list.filters.failedJobs.value',
        initialState: initialFailedJobsFilter,
        type: 'bool',
    },
    dataMode: {
        stateKey: 'operations.list.dataMode',
        initialState: initialDataMode,
    },
    to: {
        stateKey: 'operations.list.timeRange.to',
        initialState: initialTimeRangeTo,
        options: {
            serialize: dateStringToUnix,
            parse: dateUnixToString,
        },
    },
    from: {
        stateKey: 'operations.list.timeRange.from',
        initialState: initialTimeRangeFrom,
        options: {
            serialize: dateStringToUnix,
            parse: dateUnixToString,
        },
    },
    direction: {
        stateKey: 'operations.list.cursor.direction',
        initialState: initialCursorDirection,
    },
    cursor: {
        stateKey: 'operations.list.cursor.from',
        initialState: initialCursor,
        options: {
            serialize: dateStringToUnix,
            parse: dateUnixToString,
        },
    },
};

export function getListPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const {list} = draft.operations;
        const {list: queryList} = query.operations;

        updateIfChanged(list.filters.text, 'value', queryList.filters.text.value);
        updateIfChanged(list.filters.user, 'value', queryList.filters.user.value);
        updateIfChanged(list.filters.subject, 'value', queryList.filters.subject.value);
        updateIfChanged(list.filters.permissions, 'value', queryList.filters.permissions.value);
        updateIfChanged(list.filters.pool, 'value', queryList.filters.pool.value);
        updateIfChanged(list.filters.state, 'value', queryList.filters.state.value);
        updateIfChanged(list.filters.type, 'value', queryList.filters.type.value);
        updateIfChanged(list.filters.failedJobs, 'value', queryList.filters.failedJobs.value);
        updateIfChanged(list.cursor, 'direction', queryList.cursor.direction);
        updateIfChanged(list.timeRange, 'from', queryList.timeRange.from);
        updateIfChanged(list.timeRange, 'to', queryList.timeRange.to);
        updateIfChanged(list, 'dataMode', queryList.dataMode);
        updateIfChanged(list.cursor, 'from', queryList.cursor.from);
    });
}
