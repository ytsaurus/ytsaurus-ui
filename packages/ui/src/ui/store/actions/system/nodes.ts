import {ThunkAction} from 'redux-thunk';

import {Toaster} from '@gravity-ui/uikit';

import ypath from '../../../common/thor/ypath';
import Updater from '../../../utils/hammer/updater';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup, splitBatchResults} from '../../../utils/utils';
import {SYSTEM_FETCH_NODES, USE_CACHE, USE_MAX_SIZE} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getSystemNodesNodeTypesToLoad} from '../../../store/selectors/system/nodes';
import {RootState} from '../../../store/reducers';
import {SystemNodesAction} from '../../../store/reducers/system/nodes';
import {BatchSubRequest} from '../../../../shared/yt-types';

const NODES_UPDATER_ID = 'system_nodes';

const updater = new Updater();

type SystemNodesThunkAction = ThunkAction<void, RootState, unknown, SystemNodesAction>;

export function loadNodes(): SystemNodesThunkAction {
    return (dispatch) => {
        updater.add(NODES_UPDATER_ID, () => dispatch(getNodes()), 30 * 1000);
    };
}

export function cancelLoadNodes() {
    return () => {
        updater.remove(NODES_UPDATER_ID);
    };
}

function getNodes(): SystemNodesThunkAction {
    return (dispatch, getState) => {
        const nodeTypes = getSystemNodesNodeTypesToLoad(getState());

        const requests: Array<BatchSubRequest> = [
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
                    command: 'list' as const,
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
                    type: SYSTEM_FETCH_NODES.SUCCESS,
                    data: {
                        nodes: ypath.getValue(nodes),
                        racks: ypath.getValue(racks),
                    },
                });
            })
            .catch((error) => {
                dispatch({
                    type: SYSTEM_FETCH_NODES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                const toaster = new Toaster();

                toaster.add({
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
