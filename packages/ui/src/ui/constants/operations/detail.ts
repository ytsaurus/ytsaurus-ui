import {ValueOf} from '../../../@types/types';
import createActionTypes, {createPrefix} from '../../constants/utils';

const PREFIX = createPrefix('opertaions', 'details');

export const GET_OPERATION = createActionTypes(`${PREFIX}GET_OPERATION`);
export const LOAD_RESOURCE_USAGE = createActionTypes(`${PREFIX}LOAD_RESOURCE_USAGE`);
export const OPERATION_DETAIL_PARTIAL = 'OPERATION_DETAIL_PARTIAL';

export const Tab = {
    DETAILS: 'details',
    ATTRIBUTES: 'attributes',
    SPECIFICATION: 'specification',
    STATISTICS: 'statistics',
    JOBS: 'jobs',
    JOBS_TIMELINE: 'jobs_timeline',
    JOBS_MONITOR: 'jobs_monitor',
    JOB_SIZES: 'job_sizes',
    PARTITION_SIZES: 'partition_sizes',
    MONITOR: 'monitor',
    PERFORMANCE: 'performance',
} as const;

export type OperationTabType = ValueOf<typeof Tab>;

export const POLLING_INTERVAL = 15 * 1000;
export const DEFAULT_TAB = Tab.DETAILS;

export const JOBS_MONITOR = createActionTypes('JOBS_MONITOR');
