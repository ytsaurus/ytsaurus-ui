import {TimelineJob} from '../../../../../../store/reducers/operations/jobs/jobs-timeline-slice';

export const getJobTrackId = (job: TimelineJob) => job.groupName + '_' + job.cookieId.toString();
