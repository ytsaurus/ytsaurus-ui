import {YTError} from '../../../../../@types/types';
import {NODE_UNRECOGNIEZED_OPTIONS} from '../../../../constants/components/nodes/node';
import {ActionD} from '../../../../types';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';

type NodeUnrecognizedOptionsState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;
    data: unknown | any;
    host: string | undefined;
};

const initialState: NodeUnrecognizedOptionsState = {
    loading: false,
    loaded: false,
    error: undefined,
    data: undefined,
    host: undefined,
};

function reducer(state = initialState, action: NodeUnrecognizedOptionsAction) {
    switch (action.type) {
        case NODE_UNRECOGNIEZED_OPTIONS.REQUEST: {
            const data = state.host !== action.data.host ? initialState : state;
            return {...data, ...action.data, error: undefined, loading: true};
        }
        case NODE_UNRECOGNIEZED_OPTIONS.SUCCESS:
            return {...state, ...action.data, loaded: true, loading: false, error: undefined};
        case NODE_UNRECOGNIEZED_OPTIONS.FAILURE:
            return {...state, ...action.data, loading: false};
        default:
            return state;
    }
}

export type NodeUnrecognizedOptionsAction =
    | ActionD<typeof NODE_UNRECOGNIEZED_OPTIONS.REQUEST, Pick<NodeUnrecognizedOptionsState, 'host'>>
    | ActionD<typeof NODE_UNRECOGNIEZED_OPTIONS.SUCCESS, Pick<NodeUnrecognizedOptionsState, 'data'>>
    | ActionD<
          typeof NODE_UNRECOGNIEZED_OPTIONS.FAILURE,
          Pick<NodeUnrecognizedOptionsState, 'error'>
      >;

export default mergeStateOnClusterChange(initialState, {}, reducer);
