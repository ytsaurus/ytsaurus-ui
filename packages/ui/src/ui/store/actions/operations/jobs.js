import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import ypath from '../../../common/thor/ypath';
import {
    GET_COMPETITIVE_JOBS,
    GET_JOB,
    GET_JOBS,
    HIDE_INPUT_PATHS,
    OPERATION_JOBS_TABLE_ID,
    RESET_COMPETITIVE_JOBS,
    SHOW_INPUT_PATHS,
    UPDATE_FILTER,
    UPDATE_FILTER_COUNTERS,
    UPDATE_OFFSET,
} from '../../../constants/operations/jobs';
import {changeColumnSortOrder} from '../../../store/actions/tables';
import {
    getCompetitiveJobsRequestParameters,
    getJobRequestParameters,
    getJobsRequestParameters,
} from '../../../store/actions/operations/utils';
import {OPERATIONS_PAGE} from '../../../constants/operations/list';
import {getCurrentClusterConfig} from '../../../store/selectors/global';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';

import {getShowCompetitiveJobs} from '../../../pages/operations/selectors';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';

const requests = new CancelHelper();

const getOperation = (state) => state.operations.detail.operation;

export function getJob() {
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

export function getCompetitiveJobs() {
    return (dispatch, getState) => {
        const state = getState();
        const clusterConfig = getCurrentClusterConfig(state);

        requests.removeAllRequests();
        return ytApiV3
            .listJobs({
                parameters: getCompetitiveJobsRequestParameters(state),
                cancellation: requests.saveCancelToken,
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

const getJobsCanceler = new CancelHelper();

export function getJobs() {
    return (dispatch, getState) => {
        const state = getState();
        const showCompetitiveJobs = getShowCompetitiveJobs(state);

        if (showCompetitiveJobs) {
            return dispatch(getJob());
        }

        dispatch({
            type: GET_JOBS.REQUEST,
        });

        const requests = [
            {
                command: 'list_jobs',
                parameters: getJobsRequestParameters(state),
            },
            {
                command: 'list',
                parameters: {
                    path: '//sys/cluster_nodes',
                    ...USE_CACHE,
                    ...USE_MAX_SIZE,
                },
            },
        ];

        const clusterConfig = getCurrentClusterConfig(state);

        return ytApiV3Id
            .executeBatch(YTApiId.operationGetJobs, {
                parameters: {requests},
                cancellation: getJobsCanceler.removeAllAndSave,
            })
            .then(([jobs, addresses]) => {
                if (jobs.error) {
                    return Promise.reject(jobs.error);
                }

                const {jobs: items, errors, state_counts, type_counts} = jobs.output;

                dispatch({
                    type: GET_JOBS.SUCCESS,
                    data: {
                        jobs: items,
                        jobsErrors: errors,
                        addresses: ypath.getValue(addresses.output),
                        operationId: getOperation(state).$value,
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

export function setFilter(name, value) {
    return {
        type: UPDATE_FILTER,
        data: {name, value},
    };
}

export function resetCompetitiveJobs() {
    return {
        type: RESET_COMPETITIVE_JOBS,
    };
}

export function updateFilteredAttributes(attributeNames, filtered) {
    return (dispatch) => {
        attributeNames.forEach((name) => {
            const isFiltered = filtered.indexOf(name) !== -1;
            dispatch(setFilter(name, isFiltered));
        });
        dispatch(gotoJobsPage(OPERATIONS_PAGE.FIRST));
    };
}

export function updateFilter(name, value) {
    return (dispatch) => {
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

        dispatch(setFilter(name, value));
        dispatch(gotoJobsPage(OPERATIONS_PAGE.FIRST));
    };
}

export function showInputPaths(job) {
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
                        data: error,
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

export function gotoJobsPage(where) {
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
