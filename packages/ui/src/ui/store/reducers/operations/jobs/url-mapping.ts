import _ from 'lodash';

import {initialState as jobsInitialState} from '../../../../store/reducers/operations/jobs/jobs';
import {initialState as tableSortState} from '../../../../store/reducers/tables';
import {OPERATION_JOBS_TABLE_ID} from '../../../../constants/operations/jobs';
import {parseSortState} from '../../../../utils/index';
import {RootState} from '../../../../store/reducers';
import produce from 'immer';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';

const {
    filterBy,
    address,
    jobId,
    dataSource,
    type,
    state,
    withStderr,
    withFailContext,
    withSpec,
    withCompetitors,
} = jobsInitialState.filters;

const initialFilterBy = filterBy.value;
const initialAddressFilter = address.value;
const initialJobIdFilter = jobId.value;
const initialDataSourceFilter = dataSource.value;
const initialTypeFilter = type.value;
const initialStateFilter = state.value;
const initialStateChangedFilter = state.changed;
const initialWithStderrFilter = withStderr.value;
const initialWithFailContextFilter = withFailContext.value;
const initialWithSpecFilter = withSpec.value;
const initialWithCompetitorsFilter = withCompetitors.value;

const initialSortState = {...tableSortState[OPERATION_JOBS_TABLE_ID]};

export const jobsParams: LocationParameters = {
    filterBy: {
        stateKey: 'operations.jobs.filters.filterBy.value',
        initialState: initialFilterBy,
    },
    address: {
        stateKey: 'operations.jobs.filters.address.value',
        initialState: initialAddressFilter,
    },
    jobId: {
        stateKey: 'operations.jobs.filters.jobId.value',
        initialState: initialJobIdFilter,
    },
    taskName: {
        stateKey: 'operations.jobs.filters.taskName.value',
        initialState: jobsInitialState.filters.taskName.value,
    },
    source: {
        stateKey: 'operations.jobs.filters.dataSource.value',
        initialState: initialDataSourceFilter,
    },
    type: {
        stateKey: 'operations.jobs.filters.type.value',
        initialState: initialTypeFilter,
    },
    state: {
        stateKey: 'operations.jobs.filters.state.value',
        initialState: initialStateFilter,
    },
    stateChanged: {
        stateKey: 'operations.jobs.filters.state.changed',
        initialState: initialStateChangedFilter,
        type: 'bool',
    },
    withStderr: {
        stateKey: 'operations.jobs.filters.withStderr.value',
        initialState: initialWithStderrFilter,
        type: 'bool',
    },
    withFailContext: {
        stateKey: 'operations.jobs.filters.withFailContext.value',
        initialState: initialWithFailContextFilter,
        type: 'bool',
    },
    withSpec: {
        stateKey: 'operations.jobs.filters.withSpec.value',
        initialState: initialWithSpecFilter,
        type: 'bool',
    },
    withCompetitors: {
        stateKey: 'operations.jobs.filters.withCompetitors.value',
        initialState: initialWithCompetitorsFilter,
        type: 'bool',
    },
    sortState: {
        stateKey: `tables.${OPERATION_JOBS_TABLE_ID}`,
        initialState: initialSortState,
        options: {parse: parseSortState},
        type: 'object',
    },
    offset: {
        stateKey: 'operations.jobs.pagination.offset',
        initialState: jobsInitialState.pagination.offset,
        type: 'number',
    },
};

export function getJobsPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const draftFilter = draft.operations.jobs.filters;
        const queryFilter = query.operations.jobs.filters;

        updateIfChanged(draftFilter.filterBy, 'value', queryFilter.filterBy.value);
        updateIfChanged(draftFilter.address, 'value', queryFilter.address.value);
        updateIfChanged(draftFilter.jobId, 'value', queryFilter.jobId.value);
        updateIfChanged(draftFilter.taskName, 'value', queryFilter.taskName.value);
        updateIfChanged(draftFilter.dataSource, 'value', queryFilter.dataSource.value);
        updateIfChanged(draftFilter.type, 'value', queryFilter.type.value);
        updateIfChanged(draftFilter.state, 'value', queryFilter.state.value);
        updateIfChanged(draftFilter.state, 'changed', queryFilter.state.changed);
        updateIfChanged(draftFilter.withStderr, 'value', queryFilter.withStderr.value);
        updateIfChanged(draftFilter.withFailContext, 'value', queryFilter.withFailContext.value);
        updateIfChanged(draftFilter.withSpec, 'value', queryFilter.withSpec.value);
        updateIfChanged(draftFilter.withCompetitors, 'value', queryFilter.withCompetitors.value);
        updateIfChanged(
            draft.operations.jobs.pagination,
            'offset',
            query.operations.jobs.pagination.offset,
        );
        updateIfChanged(
            draft.tables,
            OPERATION_JOBS_TABLE_ID,
            query.tables[OPERATION_JOBS_TABLE_ID],
        );
    });
}
