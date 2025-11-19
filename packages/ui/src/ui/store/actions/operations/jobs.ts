// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {ThunkAction} from 'redux-thunk';

import {
    EXTRA_JOBS_COUNT,
    GET_COMPETITIVE_JOBS,
    GET_JOB,
    GET_JOBS,
    HIDE_INPUT_PATHS,
    JOB_LIST_UPDATE_FILTER,
    OPERATION_JOBS_TABLE_ID,
    RESET_COMPETITIVE_JOBS,
    SHOW_INPUT_PATHS,
    UPDATE_FILTER_COUNTERS,
    UPDATE_OFFSET,
} from '../../../constants/operations/jobs';
import {changeColumnSortOrder} from '../../../store/actions/tables';
import {OPERATIONS_PAGE} from '../../../constants/operations/list';
import {getCurrentClusterConfig} from '../../../store/selectors/global';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';

import {getShowCompetitiveJobs} from '../../../pages/operations/selectors';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import {
    JobsListAction,
    JobsState,
    UpdateFilterData,
} from '../../../store/reducers/operations/jobs/jobs';
import {OldSortState} from '../../../types';
import {ListJobsParameters} from '../../../../shared/yt-types';
import {KeysByType} from '../../../../@types/types';
import {TablesSortOrderAction} from '../../../store/reducers/tables';
import {getJobsOperationIncarnationsFilter} from '../../../store/selectors/operations/jobs';
import {fetchOperationIncarnationAvailableItems} from './jobs-operation-incarnations';

const requests = new CancelHelper();

const getOperation = (state: RootState) => state.operations.detail.operation;

type JobsListThunkAction = ThunkAction<
    void | Promise<void>,
    RootState,
    unknown,
    JobsListAction | TablesSortOrderAction
>;

export function getJob(): JobsListThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const clusterConfig = getCurrentClusterConfig(state);

        requests.removeAllRequests();
        return ytApiV3
            .getJob({
                parameters: getJobRequestParameters(state),
                cancellation: requests.saveCancelToken,
            })
            .then((job) => {
                dispatch({
                    type: GET_JOB.SUCCESS,
                    data: {
                        job,
                        clusterConfig,
                        operationId: getOperation(state).$value,
                    },
                });
                dispatch(getCompetitiveJobs());
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_JOB.CANCELLED});
                } else {
                    dispatch({
                        type: GET_JOB.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

function getJobRequestParameters(state: RootState) {
    const {operation} = state.operations.detail;
    const {filters} = state.operations.jobs;
    return {
        operation_id: operation.$value,
        job_id: filters.jobId.value,
    };
}

export function getCompetitiveJobs(): JobsListThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const clusterConfig = getCurrentClusterConfig(state);

        return ytApiV3
            .listJobs({
                parameters: getCompetitiveJobsRequestParameters(state),
                cancellation: requests.removeAllAndSave,
            })
            .then(({jobs}) => {
                dispatch({
                    type: GET_COMPETITIVE_JOBS.SUCCESS,
                    data: {
                        jobs,
                        clusterConfig,
                        operationId: getOperation(state).$value,
                    },
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_COMPETITIVE_JOBS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_COMPETITIVE_JOBS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

function getJobsRequestParameters(state: RootState): ListJobsParameters {
    const {operation} = state.operations.detail;
    const {filters, pagination} = state.operations.jobs;
    const sortState = state.tables[OPERATION_JOBS_TABLE_ID];

    const incarnation = getJobsOperationIncarnationsFilter(state);

    return {
        operation_id: operation.$value,
        /*
        include_archive: true,
        include_cypress: true,
        include_runtime: true
        */
        // prepareSortQuery(),
        ...getJobFilterParameters(filters, sortState),
        ...preparePaginationQuery(pagination),
        operation_incarnation: incarnation || undefined,
    };
}

// Operation Jobs

function getJobFilterParameters(filters: JobsState['filters'], sortState: OldSortState) {
    const filterBy = filters.filterBy.value || filters.filterBy.defaultValue;
    return {
        state: getValueIfNotDefault(filters, 'state'),
        type: getValueIfNotDefault(filters, 'type'),
        address: filterBy === 'address' ? getValueIfNotDefault(filters, 'address') : undefined,
        monitoring_descriptor:
            filterBy === 'monitoring_descriptor'
                ? getValueIfNotDefault(filters, 'monitoringDescriptor')
                : undefined,
        with_stderr: getValueIfNotDefault(filters, 'withStderr'),
        with_monitoring_descriptor: getValueIfNotDefault(filters, 'withMonitoringDescriptor'),
        with_interruption_info: getValueIfNotDefault(filters, 'withInterruptionInfo'),
        with_fail_context: getValueIfNotDefault(filters, 'withFailContext'),
        with_spec: getValueIfNotDefault(filters, 'withSpec'),
        with_competitors: getValueIfNotDefault(filters, 'withCompetitors'),
        sort_field: sortState.field || 'none',
        sort_order: sortState.asc ? ('ascending' as const) : ('descending' as const),
        task_name: getValueIfNotDefault(filters, 'taskName'),
    };
}

function getCompetitiveJobsRequestParameters(state: RootState) {
    const {operation} = state.operations.detail;
    const {job} = state.operations.jobs;
    const sortState = state.tables[OPERATION_JOBS_TABLE_ID];
    return {
        operation_id: operation.$value,
        job_competition_id: job?.attributes.job_competition_id,
        sort_field: sortState.field || 'none',
        sort_order: sortState.asc ? ('ascending' as const) : ('descending' as const),
    };
}

function getValueIfNotDefault<K extends keyof JobsState['filters']>(
    filters: JobsState['filters'],
    name: K,
): JobsState['filters'][K]['value'] | undefined {
    const filter = filters[name];
    return filter.value === filter.defaultValue ? undefined : filter.value;
}

function preparePaginationQuery({offset, limit}: {offset: number; limit: number}) {
    return {
        offset: Math.max(0, offset),
        limit: limit + EXTRA_JOBS_COUNT,
    };
}

const getJobsCanceler = new CancelHelper();

export function getJobs(): JobsListThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const showCompetitiveJobs = getShowCompetitiveJobs(state);

        const operation = getOperation(state);
        dispatch(
            fetchOperationIncarnationAvailableItems({id: operation.id, type: operation.type!}),
        );

        if (showCompetitiveJobs) {
            return dispatch(getJob());
        }

        dispatch({
            type: GET_JOBS.REQUEST,
        });

        const requests = [
            {
                command: 'list_jobs' as const,
                parameters: getJobsRequestParameters(state),
            },
        ];

        const clusterConfig = getCurrentClusterConfig(state);

        return ytApiV3Id
            .executeBatch(YTApiId.operationGetJobs, {
                parameters: {requests},
                cancellation: getJobsCanceler.removeAllAndSave,
            })
            .then(([jobs]) => {
                if (jobs.error) {
                    return Promise.reject(jobs.error);
                }

                const {jobs: items, errors, state_counts, type_counts} = jobs.output;

                dispatch({
                    type: GET_JOBS.SUCCESS,
                    data: {
                        jobs: items,
                        jobsErrors: errors,
                        operationId: operation.id,
                        clusterConfig,
                    },
                });

                dispatch({
                    type: UPDATE_FILTER_COUNTERS,
                    data: {
                        stateCounters: state_counts,
                        typeCounters: type_counts,
                    },
                });

                return undefined;
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch({
                        type: GET_JOBS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

function setJobsListFilter(data: UpdateFilterData): JobsListAction {
    return {type: JOB_LIST_UPDATE_FILTER, data};
}

export function resetCompetitiveJobs() {
    return {
        type: RESET_COMPETITIVE_JOBS,
    };
}

export function updateFilteredAttributes<
    K extends KeysByType<JobsState['filters'], {value: boolean}>,
>(filtersToUpdate: Array<K>, selected: Array<K>): JobsListThunkAction {
    return (dispatch) => {
        filtersToUpdate.forEach((name) => {
            const isFiltered = selected.indexOf(name) !== -1;
            dispatch(setJobsListFilter({name, value: isFiltered}));
        });
        dispatch(gotoJobsPage(OPERATIONS_PAGE.FIRST));
    };
}

export function updateListJobsFilter(data: UpdateFilterData): JobsListThunkAction {
    return (dispatch) => {
        const {name, value} = data;
        const isStateFilter = name === 'state';
        const useFinishTime = value === 'completed' || value === 'failed' || value === 'aborted';
        const useStartTime = value === 'all' || value === 'running';

        if (isStateFilter && useFinishTime) {
            dispatch(
                changeColumnSortOrder({
                    tableId: OPERATION_JOBS_TABLE_ID,
                    columnName: 'finish_time',
                    asc: false,
                }),
            );
        } else if (isStateFilter && useStartTime) {
            dispatch(
                changeColumnSortOrder({
                    tableId: OPERATION_JOBS_TABLE_ID,
                    columnName: 'start_time',
                    asc: true,
                }),
            );
        }

        if (name === 'jobId' && !value) {
            dispatch(resetCompetitiveJobs());
        }

        dispatch(setJobsListFilter(data));
        dispatch(gotoJobsPage(OPERATIONS_PAGE.FIRST));
    };
}

export function showInputPaths(job: {id: string}): JobsListThunkAction {
    return (dispatch) => {
        const {id: jobId} = job;

        dispatch({
            type: SHOW_INPUT_PATHS.REQUEST,
        });

        ytApiV3
            .getJobInputPaths({
                job_id: jobId,
                output_format: TYPED_OUTPUT_FORMAT,
            })
            .then((inputPaths) => {
                dispatch({
                    type: SHOW_INPUT_PATHS.SUCCESS,
                    data: inputPaths,
                });
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: SHOW_INPUT_PATHS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function hideInputPaths() {
    return {
        type: HIDE_INPUT_PATHS,
    };
}

export function gotoJobsPage(where: 'first' | 'next' | 'prev'): JobsListThunkAction {
    return (dispatch, getState) => {
        const {limit, offset} = getState().operations.jobs.pagination;

        let data = null;
        switch (where) {
            case OPERATIONS_PAGE.FIRST:
                data = 0;
                break;
            case OPERATIONS_PAGE.NEXT:
                data = offset + limit;
                break;
            case OPERATIONS_PAGE.PREV:
                data = Math.max(0, offset - limit);
                if (data === offset) {
                    return;
                }
                break;
            default:
                return;
        }

        dispatch({
            type: UPDATE_OFFSET,
            data,
        });
        dispatch(getJobs());
    };
}
