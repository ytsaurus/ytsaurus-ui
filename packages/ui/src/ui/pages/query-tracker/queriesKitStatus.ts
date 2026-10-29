import type {QueryStatus as KitQueryStatus} from '@gravity-ui/querieskit';
import {QueryStatus} from '../../types/query-tracker';

const statuses: Record<QueryStatus, KitQueryStatus> = {
    [QueryStatus.DRAFT]: 'draft',
    [QueryStatus.RUNNING]: 'running',
    [QueryStatus.PENDING]: 'running',
    [QueryStatus.COMPLETING]: 'running',
    [QueryStatus.FAILING]: 'running',
    [QueryStatus.ABORTING]: 'running',
    [QueryStatus.COMPLETED]: 'completed',
    [QueryStatus.FAILED]: 'failed',
    [QueryStatus.ABORTED]: 'aborted',
};

export function getQueryStatus(status?: QueryStatus): KitQueryStatus {
    return status === undefined ? 'draft' : statuses[status];
}
