import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getBatchError, showErrorPopup} from '../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {getOperationId} from '../../selectors/operations/operation';
import {RawJob} from '../../../types/operations/job';
import {
    JobsTimelineState,
    setInterval,
    setJobs,
    setLoading,
    setShortcut,
} from '../../reducers/operations/jobs/jobs-timeline-slice';
import dayjs, {ManipulateType} from 'dayjs';
import {selectEventsInterval, selectInterval} from '../../selectors/operations/jobs-timeline';
import {Toaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

export const setTimelineShortcut =
    (shortcut: string): AsyncAction =>
    (dispatch, getState) => {
        const interval = selectInterval(getState());
        const eventsInterval = selectEventsInterval(getState());

        const match = /(-?\d+)([a-zA-Z]+)/g.exec(shortcut);
        if (!match || !interval || !eventsInterval) return;

        const [, amount, rawRange] = match;
        if (!amount || !rawRange) return;

        const newToValue = dayjs(interval.from)
            .add(parseInt(amount, 10), rawRange as ManipulateType)
            .valueOf();

        dispatch(setShortcut(shortcut));
        dispatch(
            setInterval({
                from: interval.from,
                to: newToValue <= eventsInterval.to ? newToValue : eventsInterval.to,
            }),
        );
    };

export const getJobsWithEvents =
    (withLoading?: boolean): AsyncAction =>
    async (dispatch, getState) => {
        const operationId = getOperationId(getState());

        if (withLoading) {
            dispatch(setLoading(true));
        }
        try {
            const listResponse = await ytApiV3Id.listJobs(YTApiId.operationGetJobs, {
                operation_id: operationId,
            });

            const jobs = listResponse.jobs as (RawJob & {id: string})[];
            const requests = jobs.map(({id}) => {
                return {
                    command: 'get_job' as const,
                    parameters: {
                        operation_id: operationId,
                        job_id: id,
                    },
                };
            });

            const response = await ytApiV3Id.executeBatch<RawJob>(YTApiId.operationGetJobs, {
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
                    const maxTime = dayjs(jobEvents.at(-1)!.time).valueOf();
                    const minTime = dayjs(jobEvents[0].time).valueOf();
                    const percent = (maxTime - minTime) / 100;

                    const eventsCount = jobEvents.length;
                    let stateIndex = 0;
                    for (let i = 0; i < eventsCount; i++) {
                        const event = jobEvents[i];

                        if (!(job.job_id in acc.jobs)) {
                            acc.jobs[job.job_id] = {
                                groupName: job.task_name || '',
                                events: [],
                            };
                        }

                        const startTime = dayjs(event.time).valueOf();
                        const prevEvent = acc.jobs[job.job_id]['events'][stateIndex];
                        if (event.state) {
                            acc.jobs[job.job_id]['events'].push({
                                state: event.state,
                                startTime,
                                endTime: 0,
                                phases: [],
                                percent: 0,
                            });
                            stateIndex = acc.jobs[job.job_id]['events'].length - 1;
                        } else {
                            acc.jobs[job.job_id]['events'][stateIndex].phases.push({
                                phase: event.phase!,
                                startTime,
                            });
                        }

                        if (prevEvent) {
                            prevEvent.endTime = startTime;
                            prevEvent.percent = (startTime - prevEvent.startTime) / percent;
                        }
                    }

                    // job duration
                    acc.eventsInterval = {
                        from: Math.min(acc.eventsInterval.from, minTime),
                        to: Math.max(acc.eventsInterval.to, maxTime),
                    };

                    return acc;
                },
                {
                    jobs: {},
                    eventsInterval: {
                        from: Infinity,
                        to: 0,
                    },
                },
            );

            dispatch(setJobs(result));
            dispatch(setInterval(result.eventsInterval));
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
            if (withLoading) {
                dispatch(setLoading(false));
            }
        }
    };
