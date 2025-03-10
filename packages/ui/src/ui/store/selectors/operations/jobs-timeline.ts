import {RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {JobsTimelineState} from '../../reducers/operations/jobs/jobs-timeline-slice';

export const selectJobs = (state: RootState) => state.operations.jobsTimeline.jobs;
export const selectLoading = (state: RootState) => state.operations.jobsTimeline.isLoading;
export const selectInterval = (state: RootState) => state.operations.jobsTimeline.interval;
export const selectShortcut = (state: RootState) => state.operations.jobsTimeline.shortcut;
export const selectFilter = (state: RootState) => state.operations.jobsTimeline.filter;
export const selectJobId = (state: RootState) => state.operations.jobsTimeline.selectedJobId;

export const selectEventsInterval = (state: RootState) => {
    const interval = state.operations.jobsTimeline.eventsInterval;
    return isFinite(interval.from) ? interval : undefined;
};

export const selectJobsInInterval = createSelector(
    [selectJobs, selectInterval, selectFilter],
    (jobs, interval, filter) => {
        if (!interval) return {};

        return Object.keys(jobs).reduce<JobsTimelineState['jobs']>((acc, jobId) => {
            if (filter && !jobId.includes(filter)) {
                return acc;
            }

            const timelineJob = jobs[jobId];
            const jobEvents = timelineJob['events'];
            const minTime = jobEvents[0].startTime;
            const maxTime = jobEvents.at(-1)?.endTime || 0;

            if (
                (minTime >= interval.from && minTime <= interval.to) ||
                (maxTime >= interval.from && maxTime <= interval.to)
            ) {
                acc[jobId] = timelineJob;
            }

            return acc;
        }, {});
    },
);

export const selectJobsInIntervalByGroup = createSelector([selectJobsInInterval], (jobs) => {
    return Object.keys(jobs).reduce<Record<string, JobsTimelineState['jobs']>>((acc, jobId) => {
        const {groupName} = jobs[jobId];
        if (!(groupName in acc)) {
            acc[groupName] = {};
        }

        acc[groupName][jobId] = jobs[jobId];
        return acc;
    }, {});
});

export const getSelectedJob = createSelector([selectJobs, selectJobId], (jobs, jobId) => {
    return jobId && jobId in jobs ? jobs[jobId] : null;
});
