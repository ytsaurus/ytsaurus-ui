import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getBatchError, showErrorPopup} from '../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {getOperationId} from '../../selectors/operations/operation';
import {RawJob, RawJobEvent} from '../../../types/operations/job';
import {
    JobsTimelineState,
    setEvents,
    setInterval,
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

            const response = await ytApiV3Id.executeBatch(YTApiId.operationGetJobs, {
                parameters: {requests},
            });

            const error = getBatchError(response, 'Get operation jobs error');
            if (error) {
                throw error;
            }

            const result = response.reduce<Pick<JobsTimelineState, 'events' | 'eventsInterval'>>(
                (acc, {output: job}) => {
                    if (!job.events) return acc;

                    const jobEvents: RawJobEvent[] = job.events;
                    acc['events'][job.job_id] = jobEvents;

                    const dateArr = jobEvents.map((event) => {
                        return dayjs(event.time).valueOf();
                    });

                    acc['eventsInterval'] = {
                        from: Math.min(acc.eventsInterval.from, ...dateArr),
                        to: Math.max(acc.eventsInterval.to, ...dateArr),
                    };

                    return acc;
                },
                {
                    events: {},
                    eventsInterval: {
                        from: Infinity,
                        to: 0,
                    },
                },
            );

            dispatch(setEvents(result));
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
