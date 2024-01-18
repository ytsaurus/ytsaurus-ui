import type {ThunkAction} from 'redux-thunk';

// import ypath from '../../../../common/thor/ypath';
import {
    NODE_LOAD_FAILURE,
    NODE_LOAD_REQUEST,
    NODE_LOAD_SUCCESS,
} from '../../../../constants/components/nodes/node';
import {Node} from '../../../../store/reducers/components/nodes/nodes/node';
import type {RootState} from '../../../../store/reducers';
import type {NodeLoadAction} from '../../../../store/reducers/components/node/node';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {prepareAttributes} from '../../../../utils/cypress-attributes';
import {splitBatchResults} from '../../../../utils/utils';

type NodeLoadThunkAction = ThunkAction<any, RootState, any, NodeLoadAction>;

export function loadNodeAttributes(host: string): NodeLoadThunkAction {
    return (dispatch) => {
        dispatch({type: NODE_LOAD_REQUEST});
        return ytApiV3Id
            .executeBatch<Node | boolean>(YTApiId.nodeAttributes, {
                requests: [
                    {
                        command: 'get',
                        parameters: {
                            path: `//sys/cluster_nodes/${host}`,
                            attributes: prepareAttributes(Node.ATTRIBUTES),
                        },
                    },
                    {
                        command: 'exists',
                        parameters: {
                            path: `//sys/cluster_nodes/${host}/orchid/dynamic_config_manager/unrecognized_options`,
                        },
                    },
                ],
            })
            .then((data) => {
                const {error, results} = splitBatchResults(data, 'Failed to load nodeAttributes');
                if (error) {
                    throw error;
                }
                const [node, hasUnrecognizedOptions] = results as [Node, boolean];
                dispatch({
                    type: NODE_LOAD_SUCCESS,
                    data: {host, node, hasUnrecognizedOptions},
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
