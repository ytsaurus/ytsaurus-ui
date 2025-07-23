import {TimelineJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {TimelineAxis} from '@gravity-ui/timeline';
import {getJobTrackId} from './getJobTrackId';

export const AXIS_ID = 'main';

type Props = (jobs: TimelineJob[], axesRowHeight: number, topPadding: number) => TimelineAxis[];

export const prepareAxis: Props = (jobs, axesRowHeight, topPadding) => {
    const cookieIdSet = new Set<string>();
    for (const job of jobs) {
        if (!job.allocationId) continue;
        cookieIdSet.add(getJobTrackId(job));
    }

    return [
        {
            id: AXIS_ID,
            tracksCount: cookieIdSet.size,
            top: topPadding,
            height: axesRowHeight,
        },
    ];
};
