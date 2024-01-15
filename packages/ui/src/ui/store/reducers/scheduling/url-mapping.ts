import _ from 'lodash';

import {initialState as schedulingInitialState} from './scheduling';
import {initialState as tableSortState} from '../../../store/reducers/tables';

import {
    SCHEDULING_POOL_CHILDREN_TABLE_ID,
    SCHEDULING_POOL_TREE_TABLE_ID,
} from '../../../constants/scheduling';
import {parseSortState} from '../../../utils';
import produce from 'immer';
import {updateIfChanged} from '../../../utils/utils';
import {RootState} from '../../../store/reducers';
import {aclFiltersParams, getAclFiltersPreparedState} from '../acl/url-mapping';
import {
    makeObjectParseSerialize,
    parseSerializeNumber,
    parseSerializeString,
} from '../../../utils/parse-serialize';

export const schedulingParams = {
    pool: {
        stateKey: 'scheduling.scheduling.pool',
        initialState: '<Root>',
    },
    tree: {
        stateKey: 'scheduling.scheduling.tree',
        initialState: schedulingInitialState.tree,
    },
};

export function getSchedulingPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(draft.scheduling.scheduling, 'pool', query.scheduling.scheduling.pool);
        updateIfChanged(draft.scheduling.scheduling, 'tree', query.scheduling.scheduling.tree);
    });
}

export const schedulingOverviewParams = {
    ...schedulingParams,
    filter: {
        stateKey: 'scheduling.scheduling.filter',
        initialState: schedulingInitialState.filter,
    },
    sortState: {
        stateKey: `tables.${SCHEDULING_POOL_TREE_TABLE_ID}`,
        initialState: {...tableSortState[SCHEDULING_POOL_TREE_TABLE_ID]},
        options: {parse: parseSortState},
        type: 'object',
    },
    abc: {
        stateKey: 'scheduling.scheduling.abcServiceFilter',
        initialState: schedulingInitialState.abcServiceFilter,
        type: 'object',
        options: makeObjectParseSerialize(schedulingInitialState.abcServiceFilter, {
            slug: parseSerializeString,
            id: parseSerializeNumber,
        }),
    },
};

export function getSchedulingOverviewPreparedState(state: RootState, {query}: {query: RootState}) {
    state = getSchedulingPreparedState(state, {query});
    return produce(state, (draft) => {
        updateIfChanged(draft.scheduling.scheduling, 'filter', query.scheduling.scheduling.filter);
        updateIfChanged(
            draft.scheduling.scheduling,
            'abcServiceFilter',
            query.scheduling.scheduling.abcServiceFilter,
        );
        updateIfChanged(
            draft.tables,
            SCHEDULING_POOL_TREE_TABLE_ID,
            query.tables[SCHEDULING_POOL_TREE_TABLE_ID],
        );
    });
}

export const schedulingDetailsParams = {
    ...schedulingParams,
    filter: {
        stateKey: 'scheduling.scheduling.poolChildrenFilter',
        initialState: schedulingInitialState.poolChildrenFilter,
    },
    contentMode: {
        stateKey: 'scheduling.scheduling.contentMode',
        initialState: schedulingInitialState.contentMode,
    },
    sortState: {
        stateKey: `tables.${SCHEDULING_POOL_CHILDREN_TABLE_ID}`,
        initialState: {...tableSortState[SCHEDULING_POOL_CHILDREN_TABLE_ID]},
        options: {parse: parseSortState},
        type: 'object',
    },
};

export const schedulingMonitorParams = {
    ...schedulingParams,
};

export const schedulingAclParams = {
    ...schedulingParams,
    ...aclFiltersParams,
};

export function getSchedulingDetailsPreparedState(state: RootState, {query}: {query: RootState}) {
    state = getSchedulingPreparedState(state, {query});
    return produce(state, (draft) => {
        updateIfChanged(
            draft.scheduling.scheduling,
            'poolChildrenFilter',
            query.scheduling.scheduling.poolChildrenFilter,
        );
        updateIfChanged(
            draft.scheduling.scheduling,
            'contentMode',
            query.scheduling.scheduling.contentMode,
        );
        updateIfChanged(
            draft.tables,
            SCHEDULING_POOL_CHILDREN_TABLE_ID,
            query.tables[SCHEDULING_POOL_CHILDREN_TABLE_ID],
        );
    });
}

export function getSchedulingMonitorPreparedState(state: RootState, location: {query: RootState}) {
    return getSchedulingPreparedState(state, location);
}

export function getSchedulingAclPreparedState(prevState: RootState, {query}: {query: RootState}) {
    const state = getAclFiltersPreparedState(prevState, {query});
    return getSchedulingPreparedState(state, {query});
}
