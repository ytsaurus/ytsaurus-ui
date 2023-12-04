import {Action} from 'redux';
import {ActionD, YTError} from '../../../types';
import {mergeStateOnClusterChange} from '../utils';
import {
    SCHEDULING_EXPANDED_POOLS_CANCELLED,
    SCHEDULING_EXPANDED_POOLS_FAILURE,
    SCHEDULING_EXPANDED_POOLS_PARTITION,
    SCHEDULING_EXPANDED_POOLS_REQUEST,
    SCHEDULING_EXPANDED_POOLS_SUCCESS,
} from '../../../constants/scheduling';
import {EMPTY_OBJECT} from '../../../constants/empty';
import {OperationInfo, PoolInfo} from '../../../store/selectors/scheduling/scheduling-pools';
import {CypressNode} from '../../../../shared/yt-types';

export type PoolCypressData = CypressNode<Record<string, unknown>, string>;

export type ExpandedPoolInfo = {parentPoolPath: string; isEphemeral?: boolean};

export interface ExpandedPoolsState {
    loading: boolean;
    loaded: boolean;
    error?: YTError;

    rawPools: Record<string, PoolInfo>;
    rawOperations: Record<string, OperationInfo>;
    flattenCypressData: Record<string, PoolCypressData>;
    expandedPoolsTree: string;

    /**
     * expandedPools: Record<tree_name, Map<pool_name, ExpandedPoolInfo>>
     * example: `{'childPoolName': {parentPoolPath: 'parentPoolName/subParentName', isEphemeral: true}}`
     */
    expandedPools: Record<string, Map<string, ExpandedPoolInfo>>;
    loadAll: boolean;
}

const persistentState: Pick<ExpandedPoolsState, 'loadAll'> = {
    loadAll: false,
};

const ephemeralState: Omit<ExpandedPoolsState, keyof typeof persistentState> = {
    loading: false,
    loaded: false,
    error: undefined,

    rawPools: EMPTY_OBJECT,
    rawOperations: EMPTY_OBJECT,
    flattenCypressData: EMPTY_OBJECT,

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
          Pick<
              ExpandedPoolsState,
              'rawOperations' | 'rawPools' | 'expandedPoolsTree' | 'flattenCypressData'
          >
      >
    | ActionD<
          typeof SCHEDULING_EXPANDED_POOLS_PARTITION,
          Partial<Pick<ExpandedPoolsState, 'expandedPools' | 'loadAll'>>
      >;

export default mergeStateOnClusterChange(ephemeralState, persistentState, reducer);
