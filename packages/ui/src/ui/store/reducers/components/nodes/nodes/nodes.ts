import _ from 'lodash';
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
    GET_NODES_TAGS,
} from '../../../../../constants/components/nodes/nodes';
import type {
    changeContentMode,
    changeHostFilter,
} from '../../../../../store/actions/components/nodes/nodes';
import type {ActionD, ValueOf, YTError} from '../../../../../types';
import {NODE_TYPE, NodeType} from '../../../../../../shared/constants/system';

export interface NodesEphemeralState {
    index: number;
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: {};
    nodes: Node[];
    customColumns: [];
    versions: Record<string, ConstructorParameters<typeof Node>[1]>;
    tagsLoaded: boolean;
    tagsError: boolean;
    tags: string[];
}

export interface NodesPersistedState {
    hostFilter: string;
    nodeType: NodeType;
    contentMode: ValueOf<typeof CONTENT_MODE>;
}

const ephemeralState: NodesEphemeralState = {
    index: 0,
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    nodes: [],
    customColumns: [],
    versions: {},
    tagsLoaded: false,
    tagsError: false,
    tags: [],
};

const persistedState: NodesPersistedState = {
    hostFilter: '',
    nodeType: NODE_TYPE.ALL_NODES,
    contentMode: CONTENT_MODE.CUSTOM,
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

export type NodesState = typeof initialState;

const reducer = (state = initialState, action: NodesAction) => {
    switch (action.type) {
        case CHANGE_CONTENT_MODE:
            return {...state, contentMode: action.data.contentMode};

        case GET_NODES.REQUEST:
            return {...state, index: action.data.index, loading: true};

        case GET_NODES.SUCCESS: {
            const {index, nodes, versions} = action.data;
            if (index !== state.index) {
                return state;
            }

            const preparedNodes = _.map(
                nodes,
                (node) => new Node(node, versions[ypath.getValue(node)]),
            );

            return {
                ...state,
                nodes: preparedNodes,
                versions,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case COMPONENTS_NODES_UPDATE_NODE: {
            const {nodes, versions} = state;
            const {node} = action.data;

            const index = _.findIndex(state.nodes, ({host}) => host === ypath.getValue(node));
            if (index === -1) {
                return state;
            }
            const preparedNode = new Node(node, versions[ypath.getValue(node)]);
            const newNodes = nodes.slice();
            newNodes[index] = preparedNode;

            return {...state, nodes: newNodes};
        }

        case GET_NODES.FAILURE:
            if (action.data.index !== state.index) {
                return state;
            }
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_NODES.CANCELLED:
            if (action.data.index !== state.index) {
                return state;
            }
            return {
                ...state,
                loading: false,
            };

        case CHANGE_HOST_FILTER:
            return {...state, hostFilter: action.data.hostFilter};

        case GET_NODES_TAGS.REQUEST:
            return {...state, tagsLoading: true};

        case GET_NODES_TAGS.SUCCESS: {
            const {nodes} = action.data;

            const preparedTags = _.uniq(_.flatMap(nodes, (node) => new Node(node, {}).tags)).sort();

            return {...state, tags: preparedTags, tagsLoading: false, tagsError: false};
        }

        case GET_NODES_TAGS.FAILURE:
            return {...state, tagsLoading: false, tagsError: true};

        case CHANGE_NODE_TYPE:
            return {...state, nodeType: action.data.nodeType};

        default:
            return state;
    }
};

export type NodesAction =
    | ActionD<typeof GET_NODES.REQUEST, Pick<NodesEphemeralState, 'index'>>
    | ActionD<
          typeof GET_NODES.SUCCESS,
          Pick<NodesEphemeralState, 'index' | 'versions'> & {
              nodes: Array<ConstructorParameters<typeof Node>[0]>;
          }
      >
    | ActionD<typeof GET_NODES.FAILURE, Pick<NodesEphemeralState, 'index'> & {error: YTError}>
    | ActionD<typeof GET_NODES.CANCELLED, Pick<NodesEphemeralState, 'index'>>
    | ActionD<typeof COMPONENTS_NODES_UPDATE_NODE, ConstructorParameters<typeof Node>[0]>
    | Action<typeof GET_NODES_TAGS.REQUEST>
    | ActionD<typeof GET_NODES_TAGS.SUCCESS, {nodes: Array<ConstructorParameters<typeof Node>[0]>}>
    | Action<typeof GET_NODES_TAGS.FAILURE>
    | ReturnType<typeof changeContentMode>
    | ActionD<typeof CHANGE_NODE_TYPE, Pick<NodesState, 'nodeType'>>
    | ReturnType<typeof changeHostFilter>;

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
