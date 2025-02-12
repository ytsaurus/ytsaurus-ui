import type {ChytInfo} from '../store/reducers/chyt/list';
import createActionTypes from './utils';

export const CHYT_LIST = createActionTypes('CHYT_LIST');

export const CHYT_CLIQUE = createActionTypes('CHYT_CLIQUE');

export const CHYT_LIST_FILTERS = 'CHYT_LIST_FILTERS';

export const ChytCliquePageTab = {
    MONITORING: 'monitoring',
    SPECLET: 'speclet',
    ACL: 'acl',
    QUERY_LOGS: 'query_logs',
};

export const CHYT_OPTIONS = createActionTypes('CHYT_OPTIONS');
export const CHYT_SPECLET = createActionTypes('CHYT_SPECLET');

export const CHYT_TABLE_TITLES: Record<
    'speclet_modification_time' | 'strawberry_state_modification_time',
    string
> &
    Partial<Record<keyof ChytInfo, string>> = {
    alias: 'CHYT clique alias',
    instance_count: 'Instances',
    total_cpu: 'Cores',
    total_memory: 'Memory',
    speclet_modification_time: 'Speclet changed',
    strawberry_state_modification_time: 'Handled by ctl',
    yt_operation_finish_time: 'Finish time',
    yt_operation_start_time: 'Start time',
};
