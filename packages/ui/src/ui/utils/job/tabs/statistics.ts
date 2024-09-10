import ypath from '../../../common/thor/ypath';
import Job from '../../../pages/operations/OperationDetail/tabs/Jobs/job-selector';
import {JobStatistic, RawJob} from '../../../types/operations/job';

export function prepareStatistics(job: Job | RawJob): JobStatistic {
    // @ts-ignore
    return ypath.getValue(job, '/statistics');
}
