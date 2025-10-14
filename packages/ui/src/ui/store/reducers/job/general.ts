import {prepareJobEvents} from '../../../utils/operations/tabs/details/events/events';
import {Job} from '../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';
import {JobEvents, JobStatistic, JobStatistics} from '../../../types/operations/job';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {prepareStatistics} from '../../../utils/job/tabs/statistics';
import {GeneralActionType} from '../../../store/actions/job/general';
import {YTError} from '../../../types';
import * as JOB from '../../../constants/job';

export interface GeneralState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;

    job?: Job;
    details: {
        events: JobEvents;
        statistics: JobStatistics;
    };
}

interface Details {
    events: JobEvents;
    statistics: JobStatistics;
}

export const initialState: GeneralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,
    job: undefined,
    details: {
        events: undefined,
        statistics: undefined,
    },
};

const reducer = (state = initialState, action: GeneralActionType): GeneralState => {
    switch (action.type) {
        case JOB.LOAD_JOB_DATA_REQUEST:
            return {...state, loading: true};

        case JOB.LOAD_JOB_DATA_SUCCESS: {
            const {job, clusterConfig} = action.data;
            const operationId: string = job['operation_id'];
            const preparedJob: Job = new Job({clusterConfig, job, operationId});
            const events: JobEvents = prepareJobEvents(preparedJob);
            const statistics: JobStatistic = prepareStatistics(preparedJob);

            const details: Details = {events, statistics};

            return {
                ...state,
                details,
                job: preparedJob,
                loaded: true,
                loading: false,
                error: false,
                errorData: undefined,
            };
        }

        case JOB.LOAD_JOB_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case JOB.LOAD_JOB_DATA_CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
