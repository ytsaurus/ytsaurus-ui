import moment from 'moment';

import {OPERATIONS_DATA_MODE} from '../../../constants/operations';
import {
    getOperationsListFiltersParameters_FOR_YTFRONT_2838,
    getOperationsListTimeRange,
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
        job_competition_id: job.job_competition_id,
        sort_field: sortState.field || 'none',
        sort_order: sortState.asc ? 'ascending' : 'descending',
    };
}
