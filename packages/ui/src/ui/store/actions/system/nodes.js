import {Toaster} from '@gravity-ui/uikit';

import ypath from '../../../common/thor/ypath';
import Updater from '../../../utils/hammer/updater';
import createActionTypes from '../../../constants/utils';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {USE_CACHE, USE_MAX_SIZE} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';

export const FETCH_NODES = createActionTypes('NODES');
const NODES_UPDATER_ID = 'system_nodes';

const toaster = new Toaster();
const updater = new Updater();

export function loadNodes() {
    return (dispatch) => {
        updater.add(NODES_UPDATER_ID, () => dispatch(getNodes()), 30 * 1000);
    };
}

export function cancelLoadNodes() {
    return () => {
        updater.remove(NODES_UPDATER_ID);
    };
}

function getNodes() {
    return (dispatch, getState) => {
        const nodeTypes = getSystemNodesNodeTypesToLoad(getState());

        const requests = [
            {
                command: 'list',
                parameters: {
                    path: '//sys/racks',
                    suppress_transaction_coordinator_sync: true,
                    suppress_upstream_sync: true,
                    ...USE_MAX_SIZE,
                },
            },
            ...nodeTypes.map((nodeType) => {
                return {
                    command: 'list',
                    parameters: {
                        path: `//sys/${nodeType}`,
                        attributes: [
                            'state',
                            'banned',
                            'decommissioned',
                            'alert_count',
                            'full',
                            'rack',
                        ],
                        suppress_transaction_coordinator_sync: true,
                        suppress_upstream_sync: true,
                        ...USE_CACHE,
                        ...USE_MAX_SIZE,
                    },
                };
            }),
        ];

        return ytApiV3Id
            .executeBatch(YTApiId.systemNodes, {requests})
            .then((data) => {
                const {error, results} = splitBatchResults(data);
                if (error) {
                    return Promise.reject(error);
                }

                const [racks, ...rest] = results;
                const nodes = rest.reduce((acc, items) => {
                    return acc.concat(items);
                }, []);

                dispatch({
                    type: FETCH_NODES.SUCCESS,
                    data: {
                        nodes: ypath.getValue(nodes),
                        racks: ypath.getValue(racks),
                    },
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_NODES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.createToast({
                    name: 'load/system/nodes',
                    allowAutoHiding: false,
                    type: 'error',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Nodes',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });
                if (isRetryFutile(error.code)) {
                    dispatch(cancelLoadNodes());
                }
            });
    };
}
