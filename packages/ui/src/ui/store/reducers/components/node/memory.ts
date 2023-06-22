import {
    NODE_MEMORY_LOAD_FAILURE,
    NODE_MEMORY_LOAD_REQUEST,
    NODE_MEMORY_LOAD_SUCCESS,
    NODE_MEMORY_PARTIAL,
} from '../../../../constants/components/nodes/memory';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import type {ActionD, SortState, YTError} from '../../../../types';
import type {MemoryUsage} from '../../../../types/node/node';

interface NodeMemoryEphemeralState {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;

    memory: MemoryUsage | undefined;
    filter: string;
    host: string;
}

const ephemeralState: NodeMemoryEphemeralState = {
    loading: false,
    loaded: false,
    error: undefined,
    memory: undefined,
    host: '',
    filter: '',
};

interface NodeMemoryPersistentState {
    sortOrder: Array<SortState>;
    tablesSortOrder: Array<SortState>;
    collapsedBundles: Array<string>;
    viewMode: 'cells' | 'tables';
}

const persistentState: NodeMemoryPersistentState = {
    sortOrder: [{column: 'tabletDynamic', order: 'desc'}],
    collapsedBundles: [],

    viewMode: 'tables',
    tablesSortOrder: [{column: 'tabletDynamic', order: 'desc'}],
};

export const initialState = {
    ...ephemeralState,
    ...persistentState,
};

type NodeMemoryState = typeof initialState;

function reducer(state = initialState, action: NodeMemoryLoadAction) {
    switch (action.type) {
        case NODE_MEMORY_LOAD_REQUEST:
            return {...state, ...action.data, loading: true, loaded: false};

        case NODE_MEMORY_LOAD_SUCCESS: {
            return {
                ...state,
                ...action.data,
                loading: false,
                loaded: true,
                error: undefined,
            };
        }

        case NODE_MEMORY_LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.data,
            };
        case NODE_MEMORY_PARTIAL:
            return {...state, ...action.data};
        default:
            return state;
    }
}

export type NodeMemoryLoadAction =
    | ActionD<typeof NODE_MEMORY_LOAD_REQUEST, Pick<NodeMemoryState, 'host'>>
    | ActionD<typeof NODE_MEMORY_LOAD_SUCCESS, Pick<NodeMemoryState, 'memory'>>
    | ActionD<typeof NODE_MEMORY_LOAD_FAILURE, YTError>
    | ActionD<typeof NODE_MEMORY_PARTIAL, Partial<NodeMemoryPersistentState>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
