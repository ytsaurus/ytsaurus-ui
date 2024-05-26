import _ from 'lodash';

import {LOADING_STATUS} from '../../../../constants/index';
import {
    EXTRA_JOBS_COUNT,
    GET_COMPETITIVE_JOBS,
    GET_JOB,
    GET_JOBS,
    HIDE_INPUT_PATHS,
    JOBS_PER_PAGE_LIMIT,
    RESET_COMPETITIVE_JOBS,
    SHOW_INPUT_PATHS,
    UPDATE_FILTER,
    UPDATE_FILTER_COUNTERS,
    UPDATE_OFFSET,
} from '../../../../constants/operations/jobs';
import {GET_OPERATION} from '../../../../constants/operations/detail';
import Job from '../../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    filters: {
        filterBy: {
            value: 'id',
            defaultValue: 'id',
        },
        jobId: {
            value: '',
            defaultValue: '',
        },
        address: {
            value: '',
            defaultValue: '',
            data: [],
        },
        taskName: {
            value: '',
            defaultValue: '',
            changed: false,
        },
        state: {
            value: 'all',
            defaultValue: 'all',
            changed: false,
        },
        type: {
            value: 'all',
            defaultValue: 'all',
        },
        dataSource: {
            value: 'archive',
            defaultValue: 'archive',
        },
        withStderr: {
            value: false,
            defaultValue: false,
        },
        withFailContext: {
            value: false,
            defaultValue: false,
        },
        withSpec: {
            value: false,
            defaultValue: false,
        },
        withCompetitors: {
            value: false,
            defaultValue: false,
        },
        withMonitoringDescriptor: {
            value: false,
            defaultValue: false,
        },
    },
    inputPaths: {
        status: LOADING_STATUS.UNINITIALIZED,
    },
    pagination: {
        firstPageReached: true,
        lastPageReached: false,
        limit: JOBS_PER_PAGE_LIMIT,
        offset: 0,
    },
    jobs: [],
    job: null,
    competitiveJobs: [],
};

function updateFilter(state, name, value, extra) {
    const filters = state.filters;
    return {
        ...state,
        filters: {
            ...filters,
            [name]: {...filters[name], value, ...extra},
        },
    };
}

function addAllCounter(counters) {
    const totalCount = _.reduce(counters, (total, count) => total + count, 0);
    return {...counters, all: totalCount};
}

function removeForeignAddresses(addresses, jobs) {
    const ownAddresses = _.reduce(
        jobs,
        (addresses, job) => {
            addresses[job.address] = true;
            return addresses;
        },
        {},
    );
    return _.filter(addresses, (address) => ownAddresses[address]);
}

function prepareJobs({jobs, operationId, clusterConfig}) {
    const prepared = jobs.slice(0, JOBS_PER_PAGE_LIMIT);

    // Backward compatibility for fail_context
    // TODO: find out, do we still need it?
    return _.map(prepared, (job) => {
        job.fail_context_size = job.fail_context_size || 0;
        return new Job({clusterConfig, job, operationId});
    });
}

function getInitialStateFilterValue(currentState, operation) {
    if (currentState.changed) {
        return currentState.value;
    } else if (operation.failedJobs) {
        return 'failed';
    } else if (operation.inIntermediateState()) {
        return 'running';
    } else {
        return operation.successfullyCompleted() ? 'completed' : 'failed';
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_OPERATION.SUCCESS: {
            const {operation} = action.data;

            return state.loaded
                ? state
                : updateFilter(
                      state,
                      'state',
                      getInitialStateFilterValue(state.filters.state, operation),
                  );
        }

        case UPDATE_FILTER: {
            const {name, value} = action.data;
            return updateFilter({...state, loaded: false}, name, value, {
                changed: true,
            });
        }

        case GET_JOB.REQUEST:
        case GET_COMPETITIVE_JOBS.REQUEST:
        case GET_JOBS.REQUEST:
            return {...state, loading: true};

        case GET_JOBS.SUCCESS: {
            const {jobs, jobsErrors, addresses, operationId, clusterConfig} = action.data;
            const address = state.filters.address.value;
            const ownAddresses = removeForeignAddresses(addresses, jobs);
            const newState = updateFilter(state, 'address', address, {
                data: ownAddresses,
            });
            const loadedCount = jobs.length;

            return {
                ...newState,
                loaded: true,
                error: false,
                loading: false,
                jobs: prepareJobs({jobs, operationId, clusterConfig}),
                jobsErrors: jobsErrors,
                operationId,
                pagination: {
                    ...state.pagination,
                    firstPageReached: state.pagination.offset === 0,
                    lastPageReached: loadedCount < state.pagination.limit + EXTRA_JOBS_COUNT,
                },
            };
        }

        case GET_JOB.SUCCESS: {
            const {job, operationId, clusterConfig} = action.data;

            return {
                ...state,
                loaded: true,
                error: false,
                loading: false,
                job: new Job({job, operationId, clusterConfig}),
            };
        }

        case GET_COMPETITIVE_JOBS.SUCCESS: {
            const {jobs, operationId, clusterConfig} = action.data;
            const jobId = state.filters.jobId.value;

            const competitiveJobs = prepareJobs({jobs, operationId, clusterConfig});

            return {
                ...state,
                loaded: true,
                error: false,
                loading: false,
                operationId,
                competitiveJobs: competitiveJobs.filter(({id}) => id !== jobId),
            };
        }

        case UPDATE_FILTER_COUNTERS: {
            let {stateCounters, typeCounters} = action.data;
            stateCounters = addAllCounter(stateCounters);
            typeCounters = addAllCounter(typeCounters);
            const filters = state.filters;

            const newState = updateFilter(state, 'state', filters.state.value, {
                counters: stateCounters,
            });
            return updateFilter(newState, 'type', filters.type.value, {
                counters: typeCounters,
            });
        }

        case UPDATE_OFFSET:
            return {
                ...state,
                pagination: {...state.pagination, offset: action.data},
                wasLoaded: false,
                isLoading: true,
            };

        case GET_JOB.FAILURE:
        case GET_COMPETITIVE_JOBS.FAILURE:
        case GET_JOBS.FAILURE: {
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };
        }

        case GET_JOB.CANCELLED:
        case GET_COMPETITIVE_JOBS.CANCELLED:
        case GET_JOBS.CANCELLED:
            return {...state, loading: false, loaded: false, error: false};

        case RESET_COMPETITIVE_JOBS:
            return {
                ...state,
                job: null,
                competitiveJobs: [],
            };

        case SHOW_INPUT_PATHS.REQUEST:
            return {...state, inputPaths: {status: LOADING_STATUS.LOADING}};

        case SHOW_INPUT_PATHS.SUCCESS:
            return {
                ...state,
                inputPaths: {
                    status: LOADING_STATUS.LOADED,
                    paths: action.data,
                },
            };

        case SHOW_INPUT_PATHS.FAILURE:
            return {
                ...state,
                inputPaths: {
                    status: LOADING_STATUS.ERROR,
                    error: action.data,
                },
            };

        case HIDE_INPUT_PATHS:
            return {
                ...state,
                inputPaths: {status: LOADING_STATUS.UNINITIALIZED},
            };

        default:
            return state;
    }
};
