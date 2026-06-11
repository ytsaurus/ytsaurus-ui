import {type RootState} from '../../../reducers';

export const selectNodeRunningJobsJobs = (state: RootState) =>
    state.components.node.runningJobs.jobs;

export const selectNodeRunningJobsLoading = (state: RootState) =>
    state.components.node.runningJobs.loading;

export const selectNodeRunningJobsLoaded = (state: RootState) =>
    state.components.node.runningJobs.loaded;

export const selectNodeRunningJobsError = (state: RootState) =>
    state.components.node.runningJobs.error;

export const selectNodeRunningJobsErrorData = (state: RootState) =>
    state.components.node.runningJobs.errorData;
