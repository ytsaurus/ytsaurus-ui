import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CHANGE_CONTENT_MODE,
    CHANGE_POOL,
    CHANGE_POOL_CHILDREN_FILTER,
    CHANGE_TABLE_TREE_STATE,
    CHANGE_TREE,
    POOL_TOGGLE_DELETE_VISIBILITY,
    ROOT_POOL_NAME,
    SCHEDULING_CREATE_POOL_CANCELLED,
    SCHEDULING_DATA_CANCELLED,
    SCHEDULING_DATA_FAILURE,
    SCHEDULING_DATA_PARTITION,
    SCHEDULING_DATA_REQUEST,
    SCHEDULING_DATA_SUCCESS,
    SCHEDULING_DELETE_POOL_FAILURE,
    SCHEDULING_DELETE_POOL_REQUEST,
    SCHEDULING_DELETE_POOL_SUCCESS,
    SCHEDULING_EDIT_POOL_CANCELLED,
    SCHEDULING_EDIT_POOL_FAILURE,
    SCHEDULING_EDIT_POOL_REQUEST,
    SCHEDULING_EDIT_POOL_SUCCESS,
    TOGGLE_EDIT_VISIBILITY,
} from '../../../constants/scheduling';
import {ActionD, YTError} from '../../../types';
import {Action} from 'redux';
import {PoolInfo} from '../../../store/selectors/scheduling/scheduling-pools';

export interface SchedulingEphemeralState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData?: YTError;

    poolLoading: boolean;
    poolLoaded: boolean;
    poolError: boolean;
    poolErrorData?: YTError;

    isNewPools: boolean;

    schedulerAlerts: Array<SchedulingAlert>;
    treeResources: TreeResources;
    trees: Array<string>;

    editVisibility: boolean;
    editItem?: PoolInfo;

    deleteVisibility: boolean;
    deleteItem?: PoolInfo;

    attributesToFilter: undefined | Record<string, {parent?: string; abc: {id: number}}>;
    attributesToFilterTime: number;
}

export interface TreeResources {
    resource_usage?: unknown;
    resource_limits?: unknown;
    resource_distribution_info?: Record<string, unknown>;
    config?: unknown;
}

export interface SchedulingAlert {}

export interface SchedulingPersistentState {
    treeState: 'collapsed' | 'expanded';
    filter: string;
    poolChildrenFilter: '';
    contentMode: 'cpu' | 'memory' | 'gpu' | 'user_slots' | 'operations' | 'integral';

    tree: string;
    pool: string;
    abcServiceFilter: {
        slug?: string;
        id?: number;
    };
    monitorChartStatus: {};
}

const ephemeralState: SchedulingEphemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,

    poolLoading: false,
    poolLoaded: false,
    poolError: false,

    isNewPools: false,

    schedulerAlerts: [],
    treeResources: {},
    trees: [],

    editVisibility: false,
    editItem: undefined,

    deleteVisibility: false,
    deleteItem: undefined,

    attributesToFilter: undefined,
    attributesToFilterTime: 0,
};

const persistedState: SchedulingPersistentState = {
    treeState: 'collapsed',
    filter: '',
    poolChildrenFilter: '',
    contentMode: 'cpu',
    tree: '',
    pool: ROOT_POOL_NAME,
    abcServiceFilter: {
        slug: undefined,
    },
    monitorChartStatus: {},
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

type SchedulingState = typeof initialState;

const reducer = (state = initialState, action: SchedulingAction) => {
    switch (action.type) {
        case SCHEDULING_DATA_REQUEST:
            return {...state, loading: true};

        case SCHEDULING_DATA_PARTITION:
            return {...state, ...action.data};

        case SCHEDULING_DATA_SUCCESS:
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: false,
            };

        case SCHEDULING_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case SCHEDULING_DATA_CANCELLED:
            return {...state, ...ephemeralState};

        case SCHEDULING_DELETE_POOL_REQUEST:
        case SCHEDULING_EDIT_POOL_REQUEST:
            return {...state, poolLoading: true};

        case SCHEDULING_DELETE_POOL_SUCCESS:
        case SCHEDULING_EDIT_POOL_SUCCESS:
            return {
                ...state,
                poolLoaded: true,
                poolLoading: false,
                poolError: false,
            };

        case SCHEDULING_DELETE_POOL_FAILURE:
        case SCHEDULING_EDIT_POOL_FAILURE:
            return {
                ...state,
                poolLoading: false,
                poolError: true,
                poolErrorData: action.data.error,
            };

        case SCHEDULING_CREATE_POOL_CANCELLED:
        case SCHEDULING_EDIT_POOL_CANCELLED:
            return {
                ...state,
                poolLoading: false,
                poolLoaded: false,
                poolError: false,
                poolErrorData: undefined,
            };

        case CHANGE_TREE:
            return {...state, tree: action.data.tree};

        case CHANGE_TABLE_TREE_STATE:
            return {...state, treeState: action.data.treeState};

        case CHANGE_POOL:
            return {...state, pool: action.data.pool};

        case CHANGE_CONTENT_MODE:
            return {...state, contentMode: action.data.contentMode};

        case CHANGE_POOL_CHILDREN_FILTER:
            return {
                ...state,
                poolChildrenFilter: action.data.poolChildrenFilter,
            };

        case TOGGLE_EDIT_VISIBILITY: {
            const {visibility, item} = action.data;

            return {...state, editVisibility: visibility, editItem: item};
        }

        case POOL_TOGGLE_DELETE_VISIBILITY: {
            const {visibility, item} = action.data;

            return {...state, deleteVisibility: visibility, deleteItem: item};
        }

        default:
            return state;
    }
};

export type SchedulingAction =
    | Action<typeof SCHEDULING_DATA_REQUEST>
    | ActionD<typeof SCHEDULING_DATA_PARTITION, Partial<SchedulingState>>
    | ActionD<typeof SCHEDULING_DATA_SUCCESS, Pick<SchedulingState, 'treeResources'>>
    | ActionD<typeof SCHEDULING_DATA_FAILURE, {error: YTError}>
    | Action<typeof SCHEDULING_DATA_CANCELLED>
    | Action<typeof SCHEDULING_DELETE_POOL_REQUEST | typeof SCHEDULING_EDIT_POOL_REQUEST>
    | Action<typeof SCHEDULING_DELETE_POOL_SUCCESS | typeof SCHEDULING_EDIT_POOL_SUCCESS>
    | ActionD<
          typeof SCHEDULING_DELETE_POOL_FAILURE | typeof SCHEDULING_EDIT_POOL_FAILURE,
          {error: YTError}
      >
    | Action<typeof SCHEDULING_CREATE_POOL_CANCELLED | typeof SCHEDULING_EDIT_POOL_CANCELLED>
    | ActionD<typeof CHANGE_TREE, Pick<SchedulingState, 'tree'>>
    | ActionD<typeof CHANGE_TABLE_TREE_STATE, Pick<SchedulingState, 'treeState'>>
    | ActionD<typeof CHANGE_POOL, Pick<SchedulingState, 'pool'>>
    | ActionD<typeof CHANGE_CONTENT_MODE, Pick<SchedulingState, 'contentMode'>>
    | ActionD<typeof CHANGE_POOL_CHILDREN_FILTER, Pick<SchedulingState, 'poolChildrenFilter'>>
    | ActionD<
          typeof TOGGLE_EDIT_VISIBILITY,
          {item: SchedulingState['editItem']; visibility: boolean}
      >
    | ActionD<
          typeof POOL_TOGGLE_DELETE_VISIBILITY,
          {item: SchedulingState['deleteItem']; visibility: boolean}
      >;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
