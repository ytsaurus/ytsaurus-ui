import {getBatchError} from '../../../../shared/utils/error';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';

import format from '../../../common/hammer/format';
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
    operation_incarnation: string;
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
                    'operation_incarnation',
                ],
            });

            const jobs = listResponse.jobs as OperationJob[];
            if (jobs.length > MAX_JOBS_COUNT) {
                dispatch(setJobsCountError(true));
                return;
            }

            const result = jobs.reduce<Pick<JobsTimelineState, 'jobs' | 'eventsInterval'>>(
                (acc, job) => {
                    // filter valid jobs
                    if (!job?.events || job.job_cookie === undefined || !job.events.length)
                        return acc;

                    const jobEvents = job.events;
                    const isRunning = job.state === 'running' || job.state === 'waiting';
                    const isAborted = job.state === 'aborted';

                    // stretch running job timeline
                    const lastEventTime = dayjs(jobEvents.at(-1)!.time).valueOf();
                    const finishTime = job.finish_time
                        ? dayjs(job.finish_time).valueOf()
                        : lastEventTime;

                    let maxTime: number;
                    if (isRunning) {
                        maxTime = Date.now();
                    } else if (isAborted) {
                        maxTime = Math.max(lastEventTime, finishTime);
                    } else {
                        maxTime = lastEventTime;
                    }

                    const minTime = dayjs(jobEvents[0].time).valueOf();
                    const percent = (maxTime - minTime) / 100;

                    const timeLineJob: TimelineJob = {
                        id: job.id,
                        cookieId: job.job_cookie,
                        incarnation: job.operation_incarnation,
                        allocationId: job.allocation_id,
                        groupName: job.task_name || '',
                        events: [],
                        start_time: job.start_time || format.NO_VALUE,
                        finish_time: job.finish_time || format.NO_VALUE,
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

                    if (isRunning || isAborted) {
                        const lastEventIndex = timeLineJob.events.length - 1;
                        const {startTime} = timeLineJob.events[lastEventIndex];

                        // stretch running job timeline
                        if (isRunning) {
                            timeLineJob.events[lastEventIndex].endTime = Date.now();
                            timeLineJob.events[lastEventIndex].percent =
                                (Date.now() - startTime) / percent;
                        }

                        // set endTime to finish_time for aborted jobs
                        if (isAborted) {
                            const endTime = Math.max(finishTime, startTime);
                            timeLineJob.events[lastEventIndex].endTime = endTime;
                            timeLineJob.events[lastEventIndex].percent =
                                (endTime - startTime) / percent;
                        }
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
