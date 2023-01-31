import {Action} from 'redux';
import {ActionD, YTError} from '../../../../types';
import {
    LOAD_REPLICAS_REQUEST,
    LOAD_REPLICAS_SUCCESS,
    LOAD_REPLICAS_FAILURE,
    LOAD_REPLICAS_CANCELLED,
} from '../../../../constants/navigation/content/replicated-table';

export interface ReplicatedTableState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError | undefined;

    replicas: Array<ReplicaInfo>;
}

export interface ReplicaInfo {
    $value: string;
    $attributes: ReplicaAttributes;
}

export type ReplicaAttributes = unknown /* {
    cluster_name: {$type: 'string', $value: 'clustername'}
    error_count: {$type: 'int64', $value: '11'}
    mode: {$type: 'string', $value: 'async'}
    replica_path: {$type: 'string', $value: '//foo/bar'}
    replicated_table_tracker_enabled: {$type: 'boolean', $value: 'true'}
    replication_lag_time: {$type: 'int64', $value: '1657033924000'}
    state: {$type: 'string', $value: 'enabled'}
} */;

export const initialState: ReplicatedTableState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: undefined,

    replicas: [],
};

export default function replicatedTable(
    state = initialState,
    action: ReplicatedTableAction,
): ReplicatedTableState {
    switch (action.type) {
        case LOAD_REPLICAS_REQUEST:
            return {...state, loading: true};

        case LOAD_REPLICAS_SUCCESS: {
            const {replicas} = action.data;

            return {
                ...state,
                replicas,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_REPLICAS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_REPLICAS_CANCELLED:
            return {...state, loading: false};

        default:
            return state;
    }
}

type ReplicatedTableAction =
    | Action<typeof LOAD_REPLICAS_REQUEST>
    | ActionD<typeof LOAD_REPLICAS_SUCCESS, Pick<ReplicatedTableState, 'replicas'>>
    | ActionD<typeof LOAD_REPLICAS_FAILURE, {error: ReplicatedTableState['errorData']}>
    | Action<typeof LOAD_REPLICAS_CANCELLED>;
