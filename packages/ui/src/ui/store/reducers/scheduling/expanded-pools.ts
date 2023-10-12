import {ActionD, YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';
import {
    SCHEDULING_EXPANDED_POOLS_CANCELLED,
    SCHEDULING_EXPANDED_POOLS_FAILURE,
    SCHEDULING_EXPANDED_POOLS_PARTITION,
    SCHEDULING_EXPANDED_POOLS_REQUEST,
    SCHEDULING_EXPANDED_POOLS_SUCCESS,
} from '../../../constants/scheduling';
import {Action} from 'redux';

import {EMPTY_OBJECT} from '../../../constants/empty';
import {OperationInfo} from '../../../store/selectors/scheduling/scheduling-pools';

export interface ExpandedPoolsState {
    loading: boolean;
    loaded: boolean;
    error?: YTError;

    rawOperations: Record<string, OperationInfo>;
    expandedPoolsTree: string;

    expandedPools: Record<string, Set<string>>; // Record<tree_name, Set<pool_name>>
    loadAll: boolean;
}

const persistentState: Pick<ExpandedPoolsState, 'loadAll'> = {
    loadAll: false,
};

const ephemeralState: Omit<ExpandedPoolsState, keyof typeof persistentState> = {
    loading: false,
    loaded: false,
    error: undefined,

    rawOperations: EMPTY_OBJECT,
    expandedPoolsTree: '',

    expandedPools: EMPTY_OBJECT, //
};

const initialState = {...persistentState, ...ephemeralState};

function reducer(state = initialState, action: ExpandedPoolsAction): ExpandedPoolsState {
    switch (action.type) {
        case SCHEDULING_EXPANDED_POOLS_REQUEST:
            return {...state, loading: true};
        case SCHEDULING_EXPANDED_POOLS_FAILURE:
            return {...state, ...action.data, loading: false, loaded: false};
        case SCHEDULING_EXPANDED_POOLS_CANCELLED:
            return {...state, loading: false};
        case SCHEDULING_EXPANDED_POOLS_SUCCESS:
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        case SCHEDULING_EXPANDED_POOLS_PARTITION:
            return {...state, ...action.data};
    }
    return state;
}

export type ExpandedPoolsAction =
    | Action<typeof SCHEDULING_EXPANDED_POOLS_REQUEST>
    | Action<typeof SCHEDULING_EXPANDED_POOLS_CANCELLED>
    | ActionD<typeof SCHEDULING_EXPANDED_POOLS_FAILURE, Pick<ExpandedPoolsState, 'error'>>
    | ActionD<
          typeof SCHEDULING_EXPANDED_POOLS_SUCCESS,
          Pick<ExpandedPoolsState, 'rawOperations' | 'expandedPoolsTree'>
      >
    | ActionD<
          typeof SCHEDULING_EXPANDED_POOLS_PARTITION,
          Partial<Pick<ExpandedPoolsState, 'expandedPools' | 'loadAll'>>
      >;

export default mergeStateOnClusterChange(ephemeralState, persistentState, reducer);
