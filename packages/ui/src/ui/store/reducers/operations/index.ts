import {combineReducers} from 'redux';

import page from './page';
import detail from './detail';
import list from './list/list';
import statistics from './statistics/statistics';
import jobs from './jobs/jobs';
import jobsOperationIncarnations from './jobs/jobs-operation-incarnations';
import jobsMonitor from './jobs/jobs-monitor';
import {jobsTimelineReducer} from './jobs/jobs-timeline-slice';
import {incarnations} from './incarnations';

export default combineReducers({
    page,
    list,
    detail,
    statistics,
    jobs,
    jobsMonitor,
    jobsOperationIncarnations,
    incarnations,
    jobsTimeline: jobsTimelineReducer,
});
