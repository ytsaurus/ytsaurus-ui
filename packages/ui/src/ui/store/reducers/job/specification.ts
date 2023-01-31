import {YTError} from '../../../types';
import * as JOB from '../../../constants/job';
import {JobSpecification} from '../../../types/job';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {SpecificationActionType} from '../../../store/actions/job/specification';

export interface SpecificationEphemeralState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;

    specification: Partial<JobSpecification>;
}

export interface SpecificationPersistedState {
    omitNodeDirectory: boolean;
    omitInputTableSpecs: boolean;
    omitOutputTableSpecs: boolean;
}

export type SpecificationState = SpecificationEphemeralState & SpecificationPersistedState;

const ephemeralState: SpecificationEphemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,

    specification: {},
};

const persistedState: SpecificationPersistedState = {
    omitNodeDirectory: true,
    omitInputTableSpecs: false,
    omitOutputTableSpecs: false,
};

export const initialState: SpecificationState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action: SpecificationActionType): SpecificationState => {
    switch (action.type) {
        case JOB.LOAD_JOB_SPECIFICATION_REQUEST:
            return {...state, loading: true};

        case JOB.LOAD_JOB_SPECIFICATION_SUCCESS: {
            const {specification} = action.data;

            return {
                ...state,
                specification,
                loaded: true,
                loading: false,
                error: false,
                errorData: undefined,
            };
        }

        case JOB.LOAD_JOB_SPECIFICATION_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case JOB.LOAD_JOB_SPECIFICATION_CANCELLED:
            return {
                ...state,
                loading: false,
                loaded: false,
                error: false,
                errorData: undefined,
            };

        case JOB.CHANGE_OMIT_NODE_DIRECTORY:
            return {...state, omitNodeDirectory: !state.omitNodeDirectory};

        case JOB.CHANGE_OMIT_INPUT_TABLES_SPECS:
            return {
                ...state,
                omitInputTableSpecs: !state.omitInputTableSpecs,
            };

        case JOB.CHANGE_OMIT_OUTPUT_TABLES_SPECS:
            return {
                ...state,
                omitOutputTableSpecs: !state.omitOutputTableSpecs,
            };

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
