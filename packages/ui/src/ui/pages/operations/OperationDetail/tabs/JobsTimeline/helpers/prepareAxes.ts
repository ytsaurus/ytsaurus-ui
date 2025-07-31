import {TimelineJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimelineAxis} from '@gravity-ui/timeline';

export const AXIS_ID = 'main';

type Props = (jobs: TimelineJob[], axesRowHeight: number) => TimelineAxis[];

export const prepareAxis: Props = (jobs, axesRowHeight = 0) => {
    const validJobs = jobs.filter((job) => job.cookieId !== undefined);

    const cookieIdSet = new Set<string>();
    for (const job of validJobs) {
        if (!job.allocationId) continue;
        cookieIdSet.add(job.cookieId.toString());
    }

    return [
        {
            id: AXIS_ID,
            tracksCount: cookieIdSet.size,
            top: 0,
            height: axesRowHeight,
        },
    ];
};
