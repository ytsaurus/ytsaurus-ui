import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {getOperationId} from '../../selectors/operations/operation';
import {RawJob} from '../../../types/operations/job';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {
    JobsTimelineState,
    TimelineJob,
    setError,
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
import {MAX_JOBS_COUNT} from '../../../pages/operations/OperationDetail/tabs/JobsTimeline/constants';

const cancelHelper = new CancelHelper();

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
            dispatch(setError(undefined));
            const listResponse = await ytApiV3Id.listJobs(YTApiId.operationGetJobs, {
                operation_id: operationId,
                cancellation: cancelHelper.removeAllAndSave,
                attributes: [
                    'events',
                    'state',
                    'job_cookie',
                    'task_name',
                    'start_time',
                    'finish_time',
                    'address',
                    'allocation_id',
                ],
            });

            const jobs = listResponse.jobs as OperationJob[];
            if (jobs.length > MAX_JOBS_COUNT) {
                dispatch(setJobsCountError(true));
                return;
            }

            const result = jobs.reduce<Pick<JobsTimelineState, 'jobs' | 'eventsInterval'>>(
                (acc, job) => {
                    if (!job?.events || !job.events.length) return acc;

                    const jobEvents = job.events;
                    const isRunning = job.state === 'running';

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
                        start_time: job.start_time,
                        finish_time: job.finish_time,
                        address: job.address,
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

            if (isCancelled(error)) {
                return;
            }

            dispatch(setError(error));
        } finally {
            if (firstRequest) {
                dispatch(setLoading(false));
            }
        }
    };
