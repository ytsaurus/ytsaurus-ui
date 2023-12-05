import moment from 'moment';

import {EXTRA_JOBS_COUNT, OPERATION_JOBS_TABLE_ID} from '../../../constants/operations/jobs';
import {OPERATIONS_DATA_MODE} from '../../../constants/operations';
import {
    getOperationsListFiltersParameters_FOR_YTFRONT_2838,
    getOperationsListTimeRange,
    getValueIfNotDefault,
} from '../../../store/selectors/operations';
import {USE_CACHE} from '../../../../shared/constants/yt-api';

// Operations

export function getDefaultToTime(currentTime, dataMode) {
    return dataMode === OPERATIONS_DATA_MODE.ARCHIVE
        ? moment(currentTime).toISOString()
        : undefined;
}

export function getDefaultFromTime(currentTime, dataMode) {
    return dataMode === OPERATIONS_DATA_MODE.ARCHIVE
        ? moment(currentTime).subtract(6, 'hours').toISOString()
        : undefined;
}

function getFilterParameters(state) {
    return getOperationsListFiltersParameters_FOR_YTFRONT_2838(state);
}

function getCursorParams({operations}) {
    const {from, direction} = operations.list.cursor;

    return {
        cursor_time: from, // ISO string
        cursor_direction: direction,
    };
}

export function getListRequestParameters(state) {
    return {
        ...getFilterParameters(state),
        ...getOperationsListTimeRange(state),
        ...getCursorParams(state),
        include_archive: state.operations.list.dataMode === OPERATIONS_DATA_MODE.ARCHIVE,
        // TODO: make limit configurable by using settings, 20 | 50 | 100
        limit: 20,
        ...USE_CACHE,
    };
}

// Operation Jobs

function getJobFilterParameters(filters, sortState) {
    const filterBy = filters.filterBy.value || filters.filterBy.defaultValue;
    return {
        state: getValueIfNotDefault(filters.state),
        type: getValueIfNotDefault(filters.type),
        address: filterBy === 'address' ? getValueIfNotDefault(filters.address) : undefined,
        with_stderr: getValueIfNotDefault(filters.withStderr),
        with_fail_context: getValueIfNotDefault(filters.withFailContext),
        with_spec: getValueIfNotDefault(filters.withSpec),
        with_competitors: getValueIfNotDefault(filters.withCompetitors),
        sort_field: sortState.field || 'none',
        sort_order: sortState.asc ? 'ascending' : 'descending',
        task_name: getValueIfNotDefault(filters.taskName),
    };
}

function preparePaginationQuery({offset, limit}) {
    return {
        offset: Math.max(0, offset),
        limit: limit + EXTRA_JOBS_COUNT,
    };
}

export function getJobRequestParameters({operations}) {
    const {operation} = operations.detail;
    const {filters} = operations.jobs;
    return {
        operation_id: operation.$value,
        job_id: filters.jobId.value,
    };
}
export function getCompetitiveJobsRequestParameters({operations, tables}) {
    const {operation} = operations.detail;
    const {job} = operations.jobs;
    const sortState = tables[OPERATION_JOBS_TABLE_ID];
    return {
        operation_id: operation.$value,
        job_competition_id: job.jobCompetitionId,
        sort_field: sortState.field || 'none',
        sort_order: sortState.asc ? 'ascending' : 'descending',
    };
}

export function getJobsRequestParameters({operations, tables}) {
    const {operation} = operations.detail;
    const {filters, pagination} = operations.jobs;
    const sortState = tables[OPERATION_JOBS_TABLE_ID];

    return {
        operation_id: operation.$value,
        data_source: filters.dataSource.value,
        // following options have no use unless dataSource is 'manual' which we don't support yet
        /*
        include_archive: true,
        include_cypress: true,
        include_runtime: true
        */
        // prepareSortQuery(),
        ...getJobFilterParameters(filters, sortState),
        ...preparePaginationQuery(pagination),
    };
}
