import {RootState} from '../../reducers';

export const selectJobsErrors = (state: RootState) => state.operations.jobs.jobsErrors;
export const selectJobsOperationId = (state: RootState) => state.operations.jobs.operationId;

export const selectJobsOperationIncarnationsFilter = (state: RootState) =>
    state.operations.jobsOperationIncarnations.filter;
export const selectJobsOperationIncarnationsValues = (state: RootState) =>
    state.operations.jobsOperationIncarnations.availableValues;
