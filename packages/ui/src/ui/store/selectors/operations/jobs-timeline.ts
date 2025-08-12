import {RootState} from '../../reducers';
import {createSelector} from 'reselect';
import {JobsTimelineState} from '../../reducers/operations/jobs/jobs-timeline-slice';
import hammer from '../../../common/hammer';

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

export const selectJobsInIntervalByGroup = createSelector(
    [selectJobs, selectJobGroupsCount],
    (jobs, groupsCount) => {
        const groups = jobs.reduce<Record<string, JobsTimelineState['jobs']>>((acc, job) => {
            if (job.groupName in acc) {
                acc[job.groupName].push(job);
            } else {
                acc[job.groupName] = [job];
            }

            return acc;
        }, {});

        const groupNames = Object.keys(groups).sort();

        return {
            groupNames,
            groups: groupNames.reduce(
                (acc, groupName) => {
                    const sortedGroup = groups[groupName].sort(
                        (a, b) => Number(a.cookieId) - Number(b.cookieId),
                    );
                    const readableGroupName = hammer.format['ReadableField'](groupName);
                    const list = sortedGroup.reduce<Set<string>>((a, item) => {
                        a.add(`${readableGroupName} ${item.cookieId}`);
                        return a;
                    }, new Set());

                    acc[groupName] = {
                        title: `${readableGroupName} (${sortedGroup.length} / ${groupsCount[groupName]})`,
                        items: sortedGroup,
                        listItems: [...list],
                    };
                    return acc;
                },
                {} as Record<
                    string,
                    {title: string; items: JobsTimelineState['jobs']; listItems: string[]}
                >,
            ),
        };
    },
);

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
