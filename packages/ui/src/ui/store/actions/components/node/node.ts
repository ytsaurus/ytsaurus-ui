import type {ThunkAction} from 'redux-thunk';

// import ypath from '../../../../common/thor/ypath';
import {
    NODE_LOAD_REQUEST,
    NODE_LOAD_SUCCESS,
    NODE_LOAD_FAILURE,
} from '../../../../constants/components/nodes/node';
import {Node} from '../../../../store/reducers/components/nodes/nodes/node';
import type {RootState} from '../../../../store/reducers';
import type {NodeLoadAction} from '../../../../store/reducers/components/node/node';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type NodeLoadThunkAction = ThunkAction<any, RootState, any, NodeLoadAction>;

export function loadNodeAttributes(host: string): NodeLoadThunkAction {
    return (dispatch) => {
        dispatch({type: NODE_LOAD_REQUEST});
        return ytApiV3Id
            .get(YTApiId.nodeAttributes, {
                path: `//sys/cluster_nodes/${host}`,
                attributes: Node.ATTRIBUTES,
            })
            .then((node: Node) => {
                dispatch({
                    type: NODE_LOAD_SUCCESS,
                    data: {host, node},
                });
            })
            .catch((error: Error) => {
                dispatch({
                    type: NODE_LOAD_FAILURE,
                    data: error,
                });
            });
    };
}
