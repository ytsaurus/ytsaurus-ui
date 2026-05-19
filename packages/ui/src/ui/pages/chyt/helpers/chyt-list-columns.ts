import {type ChytInfo} from '../../../store/reducers/chyt/list';

export const CHYT_TABLE_TITLES: Record<keyof ChytInfo, string> = {
    alias: 'CHYT clique alias',
    pool: 'Pool',
    creator: 'Creator',
    creation_time: 'Creation time',
    health: 'Health',
    health_reason: 'Health reason',
    instance_count: 'Instances',
    speclet_modification_time: 'Speclet changed',
    stage: 'Stage',
    state: 'State',
    strawberry_state_modification_time: 'Handled by ctl',
    total_cpu: 'Cores',
    total_memory: 'Memory',
    yt_operation_id: 'YT operation id',
    yt_operation_finish_time: 'Finish time',
    yt_operation_start_time: 'Start time',
};
