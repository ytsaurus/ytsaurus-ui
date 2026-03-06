import {ThunkAction} from 'redux-thunk';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {getMetrics} from '../../../../common/utils/metrics';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import sortBy_ from 'lodash/sortBy';
import {updateView} from '..';
import hammer from '../../../../common/hammer';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants/index';
import {
    LOAD_REPLICAS_CANCELLED,
    LOAD_REPLICAS_FAILURE,
    LOAD_REPLICAS_REQUEST,
    LOAD_REPLICAS_SUCCESS,
} from '../../../../constants/navigation/content/replicated-table';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getPath, getTransaction} from '../../../../store/selectors/navigation';
import type {YTError} from '../../../../types';
import CancelHelper from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import type {RootState} from '../../../reducers';
import type {
    ReplicaInfo,
    ReplicatedTableAction,
} from '../../../reducers/navigation/content/replicated-table';

const requests = new CancelHelper();

type ReplicatedTableThunkAction<T = void> = ThunkAction<
    T,
    RootState,
    unknown,
    ReplicatedTableAction
>;

export function loadReplicas(): ReplicatedTableThunkAction<Promise<void>> {
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
            .catch((error: YTError) => {
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

interface PerformReplicaActionParams {
    mode: string;
    state: string;
    auto_replica_tracker: string;
    replica: ReplicaInfo;
}

export function performReplicaAction({
    mode,
    state,
    auto_replica_tracker,
    replica,
}: PerformReplicaActionParams): ReplicatedTableThunkAction<Promise<void>> {
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

export function abortAndReset(): ReplicatedTableThunkAction {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_REPLICAS_CANCELLED});
    };
}

export function updateEnableReplicatedTableTracker(
    path: string,
    value: boolean,
): ReplicatedTableThunkAction<Promise<void>> {
    return (dispatch) => {
        return yt.v3
            .set({path: path + '/@replicated_table_options/enable_replicated_table_tracker'}, value)
            .then(() => {
                dispatch(updateView());
            });
    };
}
