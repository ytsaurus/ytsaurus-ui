import {RootState} from '../../reducers';

export const getJobsErrors = (state: RootState) => state.operations.jobs.jobsErrors;
export const getJobsOperationId = (state: RootState) => state.operations.jobs.operationId;

export const getJobsOperationIncarnationsFilter = (state: RootState) =>
    state.operations.jobsOperationIncarnations.filter;
export const getJobsOperationIncarnationsValues = (state: RootState) =>
    state.operations.jobsOperationIncarnations.availableValues;
