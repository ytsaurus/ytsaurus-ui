import {RootState} from '../../reducers';

export const getJobsErrors = (state: RootState) => state.operations.jobs.jobsErrors;
export const getJobsOperationId = (state: RootState) => state.operations.jobs.operationId;
