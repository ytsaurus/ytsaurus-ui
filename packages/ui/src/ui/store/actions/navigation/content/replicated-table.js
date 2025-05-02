import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {getMetrics} from '../../../../common/utils/metrics';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../../common/hammer';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants/index';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../../rum/rum-wrap-api';

import {
    LOAD_REPLICAS_CANCELLED,
    LOAD_REPLICAS_FAILURE,
    LOAD_REPLICAS_REQUEST,
    LOAD_REPLICAS_SUCCESS,
} from '../../../../constants/navigation/content/replicated-table';
import {updateView} from '..';

import sortBy_ from 'lodash/sortBy';

const requests = new CancelHelper();

export function loadReplicas() {
    return (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch({type: LOAD_REPLICAS_REQUEST});
        requests.removeAllRequests();

        return ytApiV3Id
            .get(YTApiId.navigationRTReplicas, {
                parameters: prepareRequest('/@replicas', {
                    path,
                    transaction,
                    output_format: TYPED_OUTPUT_FORMAT,
                }),
                cancellation: requests.saveCancelToken,
            })
            .then((data) => {
                const replicas = hammer.utils.mapToYSONList(data);
                dispatch({
                    type: LOAD_REPLICAS_SUCCESS,
                    data: {
                        replicas: sortBy_(replicas, '$value'),
                    },
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: LOAD_REPLICAS_CANCELLED});
                } else {
                    dispatch({
                        type: LOAD_REPLICAS_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function performReplicaAction({mode, state, auto_replica_tracker, replica}) {
    return (dispatch) => {
        const prevMode = ypath.getValue(replica, '/@mode');
        const prevState = ypath.getValue(replica, '/@state');

        const prevAutoReplicaTracker = ypath.getValue(replica, '/@enable_replicated_table_tracker');

        const actionName = [
            mode !== prevMode && 'mode',
            state !== prevState && 'state',
            prevAutoReplicaTracker !== auto_replica_tracker && 'enable_replicated_table_tracker',
        ]
            .filter(Boolean)
            .join('_');
        if (!actionName) {
            return Promise.resolve();
        }

        getMetrics().countEvent('navigation_replicated_table_replica_action', actionName);

        const replicaId = ypath.getValue(replica, '');
        const parameters = {
            replica_id: replicaId,
            mode,
            enabled: state === 'enabled',
            enable_replicated_table_tracker: auto_replica_tracker === 'enabled',
        };

        return ytApiV3.alterTableReplica(parameters).then(() => dispatch(loadReplicas()));
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_REPLICAS_CANCELLED});
    };
}

export function updateEnableReplicatedTableTracker(path, value) {
    return (dispatch) => {
        return yt.v3
            .set({path: path + '/@replicated_table_options/enable_replicated_table_tracker'}, value)
            .then(() => {
                dispatch(updateView());
            });
    };
}
