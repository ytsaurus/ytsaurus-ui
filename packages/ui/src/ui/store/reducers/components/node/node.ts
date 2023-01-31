import {
    NODE_LOAD_REQUEST,
    NODE_LOAD_SUCCESS,
    NODE_LOAD_FAILURE,
} from '../../../../constants/components/nodes/node';
import type {Action} from 'redux';
import {Node} from '../../../../store/reducers/components/nodes/nodes/node';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import type {ActionD, YTError} from '../../../../types';

export interface NodeEphemeralState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError | undefined;
    node: Node | null;
}

const ephemeralState: NodeEphemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,
    node: null,
};

export interface NodeState extends NodeEphemeralState {}

export const initialState: NodeState = {
    ...ephemeralState,
};

function reducer(state = initialState, action: NodeLoadAction) {
    switch (action.type) {
        case NODE_LOAD_REQUEST:
            return {...state, loading: true};

        case NODE_LOAD_SUCCESS: {
            const {host, node} = action.data;

            const preparedNode = new Node({...node, $value: host});

            return {
                ...state,
                node: preparedNode,
                loading: false,
                loaded: true,
                error: false,
            };
        }

        case NODE_LOAD_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data,
            };

        default:
            return state;
    }
}

export type NodeLoadAction =
    | Action<typeof NODE_LOAD_REQUEST>
    | ActionD<typeof NODE_LOAD_SUCCESS, {host: string; node: Node}>
    | ActionD<typeof NODE_LOAD_FAILURE, YTError>;

export default mergeStateOnClusterChange(ephemeralState, {}, reducer);
