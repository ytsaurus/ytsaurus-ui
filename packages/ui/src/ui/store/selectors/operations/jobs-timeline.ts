import {RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {JobsTimelineState} from '../../reducers/operations/jobs/jobs-timeline-slice';

export const selectJobs = (state: RootState) => state.operations.jobsTimeline.jobs;
export const selectLoading = (state: RootState) => state.operations.jobsTimeline.isLoading;
export const selectInterval = (state: RootState) => state.operations.jobsTimeline.interval;
export const selectFilter = (state: RootState) => state.operations.jobsTimeline.filter;
export const selectJobId = (state: RootState) => state.operations.jobsTimeline.selectedJobId;
export const selectJobsCountError = (state: RootState) =>
    state.operations.jobsTimeline.jobsCountError;

export const selectEventsInterval = (state: RootState) => {
    const interval = state.operations.jobsTimeline.eventsInterval;
    return isFinite(interval.from) ? interval : undefined;
};

export const selectJobsByFilter = createSelector([selectJobs, selectFilter], (jobs, filter) => {
    return Object.keys(jobs).reduce<JobsTimelineState['jobs']>((acc, jobId) => {
        if (filter && !jobId.includes(filter)) {
            return acc;
        }

        acc[jobId] = jobs[jobId];
        return acc;
    }, {});
});

export const selectJobsInIntervalByGroup = createSelector([selectJobsByFilter], (jobs) => {
    return Object.keys(jobs).reduce<Record<string, JobsTimelineState['jobs']>>((acc, jobId) => {
        const {groupName} = jobs[jobId];
        if (!(groupName in acc)) {
            acc[groupName] = {};
        }

        acc[groupName][jobId] = jobs[jobId];
        return acc;
    }, {});
});

export const selectJobGroupsCount = createSelector([selectJobs], (jobs) => {
    return Object.keys(jobs).reduce<Record<string, number>>((acc, jobId) => {
        const {groupName} = jobs[jobId];

        if (groupName in acc) {
            acc[groupName]++;
        } else {
            acc[groupName] = 1;
        }

        return acc;
    }, {});
});

export const getSelectedJob = createSelector([selectJobs, selectJobId], (jobs, jobId) => {
    return jobId && jobId in jobs ? jobs[jobId] : null;
});
