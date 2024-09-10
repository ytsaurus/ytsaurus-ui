import {CompetitorsActionType} from '../../../store/actions/job/competitors';
import {mergeStateOnClusterChange} from '../utils';
import * as JOB from '../../../constants/job';
import {RawJob} from '../../../types/operations/job';
import {YTError} from '../../../types';

export interface CompetitorsState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;
    competitors: RawJob[];
}

export const initialState: CompetitorsState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,
    competitors: [],
};

const reducer = (state = initialState, action: CompetitorsActionType): CompetitorsState => {
    switch (action.type) {
        case JOB.LOAD_JOB_COMPETITORS_REQUEST:
            return {...state, loading: true};

        case JOB.LOAD_JOB_COMPETITORS_SUCCESS: {
            const {competitors} = action.data;

            return {
                ...state,
                competitors,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case JOB.LOAD_JOB_COMPETITORS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case JOB.LOAD_JOB_COMPETITORS_CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
