import {initialState as jobsInitialState} from '../../../../store/reducers/operations/jobs/jobs';
import {initialState as jobsIncarnationState} from '../../../../store/reducers/operations/jobs/jobs-operation-incarnations';
import {initialState as tableSortState} from '../../../../store/reducers/tables';
import {OPERATION_JOBS_TABLE_ID} from '../../../../constants/operations/jobs';
import {parseSortState} from '../../../../utils/index';
import {RootState} from '../../../../store/reducers';
import {produce} from 'immer';
import {updateByLocationParams} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';

const {
    filterBy,
    address,
    jobId,
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
const initialTypeFilter = type.value;
const initialStateFilter = state.value;
const initialWithStderrFilter = withStderr.value;
const initialWithFailContextFilter = withFailContext.value;
const initialWithSpecFilter = withSpec.value;
const initialWithCompetitorsFilter = withCompetitors.value;

const initialSortState = {...tableSortState[OPERATION_JOBS_TABLE_ID]};

export const jobsParams: LocationParameters = {
    incarnation: {
        stateKey: 'operations.jobsOperationIncarnations.filter',
        initialState: jobsIncarnationState.filter,
    },
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
    type: {
        stateKey: 'operations.jobs.filters.type.value',
        initialState: initialTypeFilter,
    },
    state: {
        stateKey: 'operations.jobs.filters.state.value',
        initialState: initialStateFilter,
    },
    withStderr: {
        stateKey: 'operations.jobs.filters.withStderr.value',
        initialState: initialWithStderrFilter,
        type: 'bool',
    },
    withMonitoringDescriptor: {
        stateKey: 'operations.jobs.filters.withMonitoringDescriptor.value',
        initialState: jobsInitialState.filters.withMonitoringDescriptor.value,
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
        updateByLocationParams({draft, query}, jobsParams);
    });
}
