import {RootState} from '../../reducers';

export const getJobsErrors = (state: RootState) => state.operations.jobs.jobsErrors;
export const getJobsOperationId = (state: RootState) => state.operations.jobs.operationId;

export const getJobsOperationIncarnactionsFilter = (state: RootState) =>
    state.operations.jobsOperationIncarnations.filter;
export const getJobsOperationIncarnactionsValues = (state: RootState) =>
    state.operations.jobsOperationIncarnations.availableValues;
