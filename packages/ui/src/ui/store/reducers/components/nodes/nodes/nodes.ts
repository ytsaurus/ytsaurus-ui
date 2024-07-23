import findIndex_ from 'lodash/findIndex';
import map_ from 'lodash/map';

import type {Action} from 'redux';

import {Node} from './node';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import ypath from '../../../../../common/thor/ypath';
import {
    CHANGE_CONTENT_MODE,
    CHANGE_HOST_FILTER,
    CHANGE_NODE_TYPE,
    COMPONENTS_NODES_UPDATE_NODE,
    CONTENT_MODE,
    GET_NODES,
    GET_NODES_FILTER_OPTIONS,
} from '../../../../../constants/components/nodes/nodes';
import type {
    changeContentMode,
    changeHostFilter,
} from '../../../../../store/actions/components/nodes/nodes';
import type {ActionD, ValueOf, YTError} from '../../../../../types';
import {NODE_TYPE, NodeType} from '../../../../../../shared/constants/system';

export interface NodesEphemeralState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError | undefined;
    nodes: Node[];
    customColumns: [];
    filterOptionsLoading: boolean;
    filterOptionsError: boolean;
    filterOptionsTags: string[];
    filterOptionsRacks: string[];
}

export interface NodesPersistedState {
    hostFilter: string;
    nodeTypes: Array<NodeType>;
    contentMode: ValueOf<typeof CONTENT_MODE>;
}

const ephemeralState: NodesEphemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,
    nodes: [],
    customColumns: [],
    filterOptionsLoading: false,
    filterOptionsError: false,
    filterOptionsTags: [],
    filterOptionsRacks: [],
};

const persistedState: NodesPersistedState = {
    hostFilter: '',
    nodeTypes: [NODE_TYPE.ALL_NODES],
    contentMode: CONTENT_MODE.CUSTOM,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

export type NodesState = typeof initialState;

const reducer = (state = initialState, action: NodesAction): NodesState => {
    switch (action.type) {
        case CHANGE_CONTENT_MODE:
            return {...state, contentMode: action.data.contentMode};

        case GET_NODES.REQUEST:
            return {...state, loading: true};

        case GET_NODES.SUCCESS: {
            const {nodes} = action.data;
            const preparedNodes = map_(nodes, (node) => new Node(node));

            return {
                ...state,
                nodes: preparedNodes,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case COMPONENTS_NODES_UPDATE_NODE: {
            const {nodes} = state;
            const {node} = action.data;

            const index = findIndex_(state.nodes, ({host}) => host === ypath.getValue(node));
            if (index === -1) {
                return state;
            }
            const preparedNode = new Node(node);
            const newNodes = nodes.slice();
            newNodes[index] = preparedNode;

            return {...state, nodes: newNodes};
        }

        case GET_NODES.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_NODES.CANCELLED:
            return {
                ...state,
                loading: false,
            };

        case CHANGE_HOST_FILTER:
            return {...state, hostFilter: action.data.hostFilter};

        case GET_NODES_FILTER_OPTIONS.REQUEST:
            return {...state, filterOptionsLoading: true};

        case GET_NODES_FILTER_OPTIONS.SUCCESS: {
            return {
                ...state,
                ...action.data,
                filterOptionsLoading: false,
                filterOptionsError: false,
            };
        }

        case GET_NODES_FILTER_OPTIONS.FAILURE:
            return {...state, filterOptionsLoading: false, filterOptionsError: true};

        case CHANGE_NODE_TYPE:
            return {...state, ...action.data};

        default:
            return state;
    }
};

export type NodesAction =
    | Action<typeof GET_NODES.REQUEST>
    | ActionD<
          typeof GET_NODES.SUCCESS,
          {
              nodes: Array<ConstructorParameters<typeof Node>[0]>;
          }
      >
    | ActionD<typeof GET_NODES.FAILURE, {error: YTError}>
    | Action<typeof GET_NODES.CANCELLED>
    | ActionD<typeof COMPONENTS_NODES_UPDATE_NODE, ConstructorParameters<typeof Node>[0]>
    | Action<typeof GET_NODES_FILTER_OPTIONS.REQUEST>
    | ActionD<
          typeof GET_NODES_FILTER_OPTIONS.SUCCESS,
          Pick<NodesEphemeralState, 'filterOptionsTags' | 'filterOptionsRacks'>
      >
    | Action<typeof GET_NODES_FILTER_OPTIONS.FAILURE>
    | ReturnType<typeof changeContentMode>
    | ActionD<typeof CHANGE_NODE_TYPE, Pick<NodesState, 'nodeTypes'>>
    | ReturnType<typeof changeHostFilter>;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
