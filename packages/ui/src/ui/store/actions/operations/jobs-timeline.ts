import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getBatchError, showErrorPopup} from '../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {getOperationId} from '../../selectors/operations/operation';
import {RawJob} from '../../../types/operations/job';
import {
    JobsTimelineState,
    TimelineJob,
    setInterval,
    setJobs,
    setJobsCountError,
    setLoading,
} from '../../reducers/operations/jobs/jobs-timeline-slice';
import dayjs from 'dayjs';
import {
    selectEventsInterval,
    selectIntervalsIsSame,
} from '../../selectors/operations/jobs-timeline';
import {Toaster} from '@gravity-ui/uikit';
import {MAX_JOBS_COUNT} from '../../../pages/operations/OperationDetail/tabs/JobsTimeline/constants';

const toaster = new Toaster();

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

export const resetInterval = (): AsyncAction => (dispatch, getState) => {
    const interval = selectEventsInterval(getState());
    if (!interval) return;

    dispatch(setInterval(interval));
};

type OperationJob = RawJob & {
    id: string;
    allocation_id?: string;
    job_cookie: number;
    task_name: string;
};

export const getJobsWithEvents =
    (firstRequest?: boolean): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const operationId = getOperationId(state);
        const sameIntervals = selectIntervalsIsSame(state);

        if (firstRequest) {
            dispatch(setLoading(true));
        }
        try {
            const listResponse = await ytApiV3Id.listJobs(YTApiId.operationGetJobs, {
                operation_id: operationId,
            });

            const jobs = listResponse.jobs as OperationJob[];
            if (jobs.length > MAX_JOBS_COUNT) {
                dispatch(setJobsCountError(true));
                return;
            }

            const requests = jobs.map(({id}) => {
                return {
                    command: 'get_job' as const,
                    parameters: {
                        operation_id: operationId,
                        job_id: id,
                    },
                };
            });

            const response = await ytApiV3Id.executeBatch<OperationJob>(YTApiId.operationGetJobs, {
                parameters: {requests},
            });

            const error = getBatchError(response, 'Get operation jobs error');
            if (error) {
                throw error;
            }

            const result = response.reduce<Pick<JobsTimelineState, 'jobs' | 'eventsInterval'>>(
                (acc, {output: job}) => {
                    if (!job?.events || !job.events.length) return acc;

                    const jobEvents = job.events;

                    const lastState = jobEvents.reduce<string | null>((acc, event) => {
                        if (event.state) acc = event.state;
                        return acc;
                    }, null);
                    const isRunning = lastState === 'running';

                    // stretch running job timeline
                    const maxTime = isRunning
                        ? Date.now()
                        : dayjs(jobEvents.at(-1)!.time).valueOf();
                    const minTime = dayjs(jobEvents[0].time).valueOf();
                    const percent = (maxTime - minTime) / 100;

                    const timeLineJob: TimelineJob = {
                        id: job.job_id,
                        cookieId: job.job_cookie,
                        allocationId: job.allocation_id,
                        groupName: job.task_name || '',
                        events: [],
                    };

                    const eventsCount = jobEvents.length;
                    let stateIndex = 0;
                    for (let i = 0; i < eventsCount; i++) {
                        const event = jobEvents[i];

                        const startTime = dayjs(event.time).valueOf();
                        const prevEvent = timeLineJob['events'][stateIndex];
                        if (event.state) {
                            timeLineJob['events'].push({
                                state: event.state,
                                startTime,
                                endTime: 0,
                                phases: [],
                                percent: 0,
                            });
                            stateIndex = timeLineJob['events'].length - 1;
                        } else {
                            timeLineJob['events'][stateIndex].phases.push({
                                phase: event.phase!,
                                startTime,
                            });
                        }

                        if (prevEvent) {
                            prevEvent.endTime = startTime;
                            prevEvent.percent = (startTime - prevEvent.startTime) / percent;
                        }
                    }

                    // stretch running job timeline
                    if (isRunning) {
                        const lastEventIndex = timeLineJob.events.length - 1;
                        const {startTime} = timeLineJob.events[lastEventIndex];
                        timeLineJob.events[lastEventIndex].endTime = Date.now();
                        timeLineJob.events[lastEventIndex].percent =
                            (Date.now() - startTime) / percent;
                    }

                    acc.jobs.push(timeLineJob);

                    // job duration
                    acc.eventsInterval = {
                        from: Math.min(acc.eventsInterval.from, minTime),
                        to: Math.max(acc.eventsInterval.to, maxTime),
                    };

                    return acc;
                },
                {
                    jobs: [],
                    eventsInterval: {
                        from: Infinity,
                        to: 0,
                    },
                },
            );

            dispatch(setJobs(result));
            if (firstRequest || sameIntervals) {
                dispatch(setInterval(result.eventsInterval));
            }
        } catch (e) {
            const error = e as Error;
            toaster.add({
                name: 'get jobs events',
                autoHiding: false,
                theme: 'danger',
                title: 'Failed to load events',
                content: error.message,
                actions: [{label: ' view', onClick: () => showErrorPopup(error)}],
            });
        } finally {
            if (firstRequest) {
                dispatch(setLoading(false));
            }
        }
    };
