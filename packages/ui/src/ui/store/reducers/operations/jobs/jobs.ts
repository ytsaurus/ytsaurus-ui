import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {Action} from 'redux';

import {LOADING_STATUS} from '../../../../constants/index';
import {
    EXTRA_JOBS_COUNT,
    GET_COMPETITIVE_JOBS,
    GET_JOB,
    GET_JOBS,
    HIDE_INPUT_PATHS,
    JOBS_PER_PAGE_LIMIT,
    JOB_LIST_UPDATE_FILTER,
    RESET_COMPETITIVE_JOBS,
    SHOW_INPUT_PATHS,
    UPDATE_FILTER_COUNTERS,
    UPDATE_OFFSET,
} from '../../../../constants/operations/jobs';
import {GET_OPERATION} from '../../../../constants/operations/detail';
import {Job} from '../../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';
import {ActionD, ValueOf, YTError} from '../../../../types';
import {ClusterConfig, ListJobsItem, ListJobsResponse} from '../../../../../shared/yt-types';
import {DetailedOperationSelector} from '../../../../pages/operations/selectors';

export type WithDefaultValue<T> = {
    value: T;
    defaultValue: T;
};

export type JobsState = {
    loaded: boolean;
    loading: boolean;
    /**
     * Do we really need it?
     */
    isLoading?: boolean;
    error: boolean;
    errorData?: YTError | unknown;
    operationId?: string;
    filters: {
        filterBy: WithDefaultValue<string>;
        jobId: WithDefaultValue<string>;
        address: WithDefaultValue<string> & {data: Array<unknown>};
        monitoringDescriptor: WithDefaultValue<string>;
        taskName: WithDefaultValue<string>;
        state: WithDefaultValue<string> & {counters?: Record<string, number>};
        type: WithDefaultValue<string> & {counters?: Record<string, number>};
        withStderr: WithDefaultValue<boolean>;
        withFailContext: WithDefaultValue<boolean>;
        withSpec: WithDefaultValue<boolean>;
        withCompetitors: WithDefaultValue<boolean>;
        withMonitoringDescriptor: WithDefaultValue<boolean>;
        withInterruptionInfo: WithDefaultValue<boolean>;
    };

    inputPaths: {
        status: ValueOf<typeof LOADING_STATUS>;
        error?: YTError;
        paths?: Array<unknown>;
    };
    pagination: {
        firstPageReached: boolean;
        lastPageReached: boolean;
        limit: number;
        offset: number;
    };
    jobs: Array<unknown>;
    jobsErrors?: Array<YTError>;
    job?: Job;
    competitiveJobs: Array<unknown>;
};

export const initialState: JobsState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {} as any,
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
        monitoringDescriptor: {
            value: '',
            defaultValue: '',
        },
        taskName: {
            value: '',
            defaultValue: '',
        },
        state: {
            value: 'auto',
            defaultValue: 'all',
        },
        type: {
            value: 'all',
            defaultValue: 'all',
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
        withInterruptionInfo: {
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
    job: undefined,
    competitiveJobs: [],
};

function updateFilter<K extends keyof JobsState['filters']>(
    state: JobsState,
    name: K,
    value: JobsState['filters'][K]['value'],
    extra?: Omit<JobsState['filters'][K], 'value' | 'defaultValue'>,
) {
    const filters = state.filters;
    return {
        ...state,
        filters: {
            ...filters,
            [name]: {...filters[name], value, ...extra},
        },
    };
}

function aggregateAllValue(counters: Record<string, number>) {
    const totalCount = reduce_(counters, (total, count) => total + count, 0);
    return {...counters, all: totalCount};
}

function removeForeignAddresses(jobs: Array<{address: string}>) {
    return jobs.map(({address}) => address);
}

function prepareJobs({
    jobs,
    operationId,
    clusterConfig,
}: {
    jobs: ListJobsResponse['jobs'];
    operationId: string;
    clusterConfig: ClusterConfig;
}) {
    const prepared = jobs.slice(0, JOBS_PER_PAGE_LIMIT);

    // Backward compatibility for fail_context
    // TODO: find out, do we still need it?
    return map_(prepared, (job) => {
        job.fail_context_size = job.fail_context_size || 0;
        return new Job({clusterConfig, job, operationId});
    });
}

function getInitialStateFilterValue<T>(
    currentState: WithDefaultValue<T>,
    operation: DetailedOperationSelector,
) {
    if (currentState.value !== 'auto') {
        return currentState.value;
    } else if (operation.failedJobs) {
        return 'failed';
    } else if (operation.inIntermediateState()) {
        return 'running';
    } else {
        return operation.successfullyCompleted() ? 'completed' : 'failed';
    }
}

export default (state = initialState, action: JobsListAction): JobsState => {
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

        case JOB_LIST_UPDATE_FILTER: {
            const {name, value} = action.data;
            return updateFilter({...state, loaded: false}, name, value);
        }

        case GET_JOB.REQUEST:
        case GET_COMPETITIVE_JOBS.REQUEST:
        case GET_JOBS.REQUEST:
            return {...state, loading: true};

        case GET_JOBS.SUCCESS: {
            const {jobs, jobsErrors, operationId, clusterConfig} = action.data;
            const address = state.filters.address.value;
            const ownAddresses = removeForeignAddresses(jobs);
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
            stateCounters = aggregateAllValue(stateCounters);
            typeCounters = aggregateAllValue(typeCounters);
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
                job: undefined,
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
                    error: action.data.error,
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

export type UpdateFilterData = {
    [KEY in keyof JobsState['filters']]: {
        name: KEY;
        value: JobsState['filters'][KEY]['value'];
    };
}[keyof JobsState['filters']];

export type JobsListAction =
    | Action<
          | typeof GET_JOB.REQUEST
          | typeof GET_COMPETITIVE_JOBS.REQUEST
          | typeof GET_JOBS.REQUEST
          | typeof GET_JOB.CANCELLED
          | typeof GET_COMPETITIVE_JOBS.CANCELLED
          | typeof GET_JOBS.CANCELLED
          | typeof RESET_COMPETITIVE_JOBS
          | typeof SHOW_INPUT_PATHS.REQUEST
          | typeof HIDE_INPUT_PATHS
      >
    | ActionD<
          typeof GET_JOBS.SUCCESS,
          {
              jobs: ListJobsResponse['jobs'];
              jobsErrors: JobsState['jobsErrors'];
              operationId: string;
              clusterConfig: ClusterConfig;
          }
      >
    | ActionD<
          typeof GET_JOB.SUCCESS,
          {job: ListJobsItem; operationId: string; clusterConfig: ClusterConfig}
      >
    | ActionD<
          typeof GET_COMPETITIVE_JOBS.SUCCESS,
          {jobs: Array<ListJobsItem>; operationId: string; clusterConfig: ClusterConfig}
      >
    | ActionD<typeof GET_OPERATION.SUCCESS, {operation: DetailedOperationSelector}>
    | ActionD<typeof JOB_LIST_UPDATE_FILTER, UpdateFilterData>
    | ActionD<
          typeof UPDATE_FILTER_COUNTERS,
          {stateCounters: Record<string, number>; typeCounters: Record<string, number>}
      >
    | ActionD<typeof UPDATE_OFFSET, number>
    | ActionD<
          | typeof GET_JOB.FAILURE
          | typeof GET_COMPETITIVE_JOBS.FAILURE
          | typeof GET_JOBS.FAILURE
          | typeof SHOW_INPUT_PATHS.FAILURE,
          {error: YTError}
      >
    | ActionD<typeof SHOW_INPUT_PATHS.SUCCESS, Array<unknown>>;
