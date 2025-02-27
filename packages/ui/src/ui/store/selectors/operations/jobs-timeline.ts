import {RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {JobsTimelineState} from '../../reducers/operations/jobs/jobs-timeline-slice';
import dayjs from 'dayjs';

export const selectEvents = (state: RootState) => state.operations.jobsTimeline.events;
export const selectLoading = (state: RootState) => state.operations.jobsTimeline.isLoading;
export const selectInterval = (state: RootState) => state.operations.jobsTimeline.interval;
export const selectShortcut = (state: RootState) => state.operations.jobsTimeline.shortcut;
export const selectFilter = (state: RootState) => state.operations.jobsTimeline.filter;

export const selectEventsInterval = (state: RootState) => {
    const interval = state.operations.jobsTimeline.eventsInterval;
    return isFinite(interval.from) ? interval : undefined;
};

export const selectEventsInInterval = createSelector(
    [selectEvents, selectInterval, selectFilter],
    (events, interval, filter) => {
        if (!interval) return {};

        return Object.keys(events).reduce<JobsTimelineState['events']>((acc, jobId) => {
            if (filter && !jobId.includes(filter)) {
                return acc;
            }

            const jobEvents = events[jobId];
            const times = jobEvents.map((event) => dayjs(event.time).valueOf());

            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);

            if (
                (minTime >= interval.from && minTime <= interval.to) ||
                (maxTime >= interval.from && maxTime <= interval.to)
            ) {
                acc[jobId] = jobEvents;
            }

            return acc;
        }, {});
    },
);
