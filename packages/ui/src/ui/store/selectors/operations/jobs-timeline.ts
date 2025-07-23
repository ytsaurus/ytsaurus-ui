import {RootState} from '../../reducers';
import {createSelector} from 'reselect';

export const selectJobs = (state: RootState) => state.operations.jobsTimeline.jobs;
export const selectLoading = (state: RootState) => state.operations.jobsTimeline.isLoading;
export const selectInterval = (state: RootState) => state.operations.jobsTimeline.interval;
export const selectFilter = (state: RootState) => state.operations.jobsTimeline.filter;
export const selectActiveJob = (state: RootState) => state.operations.jobsTimeline.selectedJob;
export const selectJobsOverloadError = (state: RootState) =>
    state.operations.jobsTimeline.jobsCountError;
export const selectError = (state: RootState) => state.operations.jobsTimeline.error;

export const selectEventsInterval = (state: RootState) => {
    const interval = state.operations.jobsTimeline.eventsInterval;
    return isFinite(interval.from) ? interval : undefined;
};

export const selectJobsEmptyError = createSelector(
    [selectJobs, selectLoading],
    (jobs, isLoading) => {
        return jobs.length === 0 && !isLoading;
    },
);

export const selectSortedJobs = createSelector([selectJobs], (jobs) => {
    return [...jobs].sort((a, b) => {
        const groupNameComparison = a.groupName.localeCompare(b.groupName);

        if (groupNameComparison !== 0) {
            return groupNameComparison;
        }

        return Number(a.cookieId) - Number(b.cookieId);
    });
});

export const getSelectedJob = createSelector([selectJobs, selectActiveJob], (jobs, activeJob) => {
    return jobs.find(({id}) => activeJob === id) || null;
});

export const selectIntervalsIsSame = createSelector(
    [selectInterval, selectEventsInterval],
    (interval, eInterval) => {
        if (interval && eInterval) {
            if (interval.from === eInterval.from && interval.to === eInterval.to) return true;
        }

        return !interval && !eInterval;
    },
);
