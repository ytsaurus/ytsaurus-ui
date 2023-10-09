import {ActionD, YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';
import {
    SCHEDULING_OPERATIONS_CANCELLED,
    SCHEDULING_OPERATIONS_FAILURE,
    SCHEDULING_OPERATIONS_PARTITION,
    SCHEDULING_OPERATIONS_REQUEST,
    SCHEDULING_OPERATIONS_SUCCESS,
} from '../../../constants/scheduling';
import {Action} from 'redux';

import {EMPTY_OBJECT} from '../../../constants/empty';
import {OperationInfo} from '../../../store/selectors/scheduling/scheduling-pools';

export interface SchedulingOperationsState {
    loading: boolean;
    loaded: boolean;
    error?: YTError;

    rawOperations: Record<string, OperationInfo>;
    rawOperationsTree: string;

    expandedPools: Record<string, Set<string>>; // Record<tree_name, Set<pool_name>>
    loadAllOperations: boolean;
}

const persistentState = {
    loadAllOperations: false,
};

const ephemeralState: Omit<SchedulingOperationsState, keyof typeof persistentState> = {
    loading: false,
    loaded: false,
    error: undefined,

    rawOperations: EMPTY_OBJECT,
    rawOperationsTree: '',

    expandedPools: EMPTY_OBJECT, //
};

const initialState = {...persistentState, ...ephemeralState};

function reducer(
    state = initialState,
    action: SchedulingOperationsAction,
): SchedulingOperationsState {
    switch (action.type) {
        case SCHEDULING_OPERATIONS_REQUEST:
            return {...state, loading: true};
        case SCHEDULING_OPERATIONS_FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case SCHEDULING_OPERATIONS_CANCELLED:
            return {...state, loading: false};
        case SCHEDULING_OPERATIONS_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case SCHEDULING_OPERATIONS_PARTITION:
            return {...state, ...action.data};
    }
    return state;
}

export type SchedulingOperationsAction =
    | Action<typeof SCHEDULING_OPERATIONS_REQUEST>
    | Action<typeof SCHEDULING_OPERATIONS_CANCELLED>
    | ActionD<typeof SCHEDULING_OPERATIONS_FAILURE, Pick<SchedulingOperationsState, 'error'>>
    | ActionD<
          typeof SCHEDULING_OPERATIONS_SUCCESS,
          Pick<SchedulingOperationsState, 'rawOperations' | 'rawOperationsTree'>
      >
    | ActionD<
          typeof SCHEDULING_OPERATIONS_PARTITION,
          Partial<Pick<SchedulingOperationsState, 'expandedPools' | 'loadAllOperations'>>
      >;

export default mergeStateOnClusterChange(ephemeralState, persistentState, reducer);
