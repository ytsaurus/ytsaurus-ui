import _ from 'lodash';
import {createSelector} from 'reselect';

import ypath from '../../../../common/thor/ypath';
import {RootState} from '../../../../store/reducers';
import {calculateLoadingStatus} from '../../../../utils/utils';

export const getNavigationReplicatedTableLoadingStatus = createSelector(
    [
        (store: RootState) => store.navigation.content.replicatedTable.loading,
        (store: RootState) => store.navigation.content.replicatedTable.loaded,
        (store: RootState) => store.navigation.content.replicatedTable.error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const getReplicatedTableReplicas = (state: RootState) =>
    state.navigation.content.replicatedTable.replicas;

export const getReplicatedTableData = (state: RootState) =>
    state.navigation.content.replicatedTable;

export const getAllowEnableReplicatedTracker = createSelector(
    [getReplicatedTableReplicas],
    (replicas) => {
        return _.some(replicas, (item) => {
            return Boolean(ypath.getValue(item, '/@replicated_table_tracker_enabled'));
        });
    },
);

export const getReplicatedTableReplicasMap = createSelector(
    [getReplicatedTableReplicas],
    (replicas) => {
        return _.reduce(
            replicas,
            (acc, {$value, $attributes}) => {
                acc[$value] = {
                    error_count: ypath.getNumberDeprecated($attributes, '/error_count'),
                    cluster_name: ypath.getValue($attributes, '/cluster_name'),
                    mode: ypath.getValue($attributes, '/mode'),
                    replica_path: ypath.getValue($attributes, '/replica_path'),
                    replicated_table_tracker_enabled: ypath.getBoolean(
                        $attributes,
                        '/replicated_table_tracker_enabled',
                    ),
                    replication_lag_time: ypath.getNumberDeprecated(
                        $attributes,
                        '/replication_lag_time',
                    ),
                    state: ypath.getValue($attributes, '/state'),
                };
                return acc;
            },
            {} as Record<
                string,
                {
                    error_count: number;
                    cluster_name: string;
                    mode: string;
                    replica_path: string;
                    replicated_table_tracker_enabled: boolean;
                    replication_lag_time: number;
                    state: string;
                }
            >,
        );
    },
);
