import _ from 'lodash';
import moment from 'moment';
import {createSelector} from 'reselect';
import {RootState} from '../../../store/reducers';
import {getOperationId} from './operation';

export const getJobsMonitorError = (state: RootState) => state.operations.jobsMonitor.error;
export const getJobsMonitorOperationId = (state: RootState) =>
    state.operations.jobsMonitor.operation_id;
export const getJobsMonitorItems = (state: RootState) => state.operations.jobsMonitor.jobs;

export const getJobsMonitoringItemsWithDescriptor = createSelector(
    [getJobsMonitorItems],
    (items) => {
        return _.filter(items, ({monitoring_descriptor}) => Boolean(monitoring_descriptor));
    },
);

export const getJobsMonitorFromTo = createSelector(
    [getJobsMonitoringItemsWithDescriptor],
    (items) => {
        let from: number | undefined;
        let to: number | undefined;
        _.forEach(items, ({start_time, finish_time}) => {
            if (start_time) {
                const start = moment(start_time).valueOf();
                from = _.min([start, from]);
            }
            if (finish_time) {
                const finish = moment(finish_time).valueOf();
                to = _.max([finish, to]);
            }
        });
        return {from, to};
    },
);

export const getJobsMonitorDescriptor = createSelector(
    [getJobsMonitoringItemsWithDescriptor],
    (jobs) => {
        const tmp = _.map(jobs, 'monitoring_descriptor');
        return tmp.join('|');
    },
);

export const getJobsMonitorTabVisible = createSelector(
    [getOperationId, getJobsMonitorOperationId, getJobsMonitorDescriptor, getJobsMonitorError],
    (opId, jobMonId, jobsDescriptor, error) => {
        if (opId !== jobMonId) {
            return false;
        }
        if (!_.isEmpty(error)) {
            return true;
        }

        return Boolean(jobsDescriptor);
    },
);
