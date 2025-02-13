import ypath from '../../../common/thor/ypath';
import type {Job} from '../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';
import type {JobStatistic, RawJob} from '../../../types/operations/job';

export function prepareStatistics(job: Job | RawJob): JobStatistic {
    // @ts-ignore
    return ypath.getValue(job, '/statistics');
}
