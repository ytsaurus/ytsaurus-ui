import {RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {JobsTimelineState} from '../../reducers/operations/jobs/jobs-timeline-slice';

export const selectJobs = (state: RootState) => state.operations.jobsTimeline.jobs;
export const selectLoading = (state: RootState) => state.operations.jobsTimeline.isLoading;
export const selectInterval = (state: RootState) => state.operations.jobsTimeline.interval;
export const selectFilter = (state: RootState) => state.operations.jobsTimeline.filter;
export const selectActiveJob = (state: RootState) => state.operations.jobsTimeline.selectedJob;
export const selectJobsCountError = (state: RootState) =>
    state.operations.jobsTimeline.jobsCountError;

export const selectEventsInterval = (state: RootState) => {
    const interval = state.operations.jobsTimeline.eventsInterval;
    return isFinite(interval.from) ? interval : undefined;
};

export const selectJobsByFilter = createSelector([selectJobs, selectFilter], (jobs, filter) => {
    return jobs.filter(({cookieId, id}) => {
        return cookieId.toString().includes(filter) || id.includes(filter);
    });
});

export const selectJobsInIntervalByGroup = createSelector([selectJobsByFilter], (jobs) => {
    return jobs.reduce<Record<string, JobsTimelineState['jobs']>>((acc, job) => {
        if (job.groupName in acc) {
            acc[job.groupName].push(job);
        } else {
            acc[job.groupName] = [job];
        }

        return acc;
    }, {});
});

export const selectJobGroupsCount = createSelector([selectJobs], (jobs) => {
    return jobs.reduce<Record<string, number>>((acc, job) => {
        if (job.groupName in acc) {
            acc[job.groupName]++;
        } else {
            acc[job.groupName] = 1;
        }
        return acc;
    }, {});
});

export const getSelectedJob = createSelector([selectJobs, selectActiveJob], (jobs, activeJob) => {
    return jobs.find(({id}) => activeJob.id === id) || null;
});
