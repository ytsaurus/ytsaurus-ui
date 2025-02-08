import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import max_ from 'lodash/max';
import min_ from 'lodash/min';

import moment from 'moment';
import {createSelector} from 'reselect';
import {RootState} from '../../../store/reducers';
import {getOperationId} from './operation';

export const getJobsMonitorError = (state: RootState) => state.operations.jobsMonitor.error;
export const getJobsMonitorOperationId = (state: RootState) =>
    state.operations.jobsMonitor.operation_id;
export const getJobsMonitorItems = (state: RootState) => state.operations.jobsMonitor.jobs;
export const getJobsMonitorItemsLoading = (state: RootState) =>
    state.operations.jobsMonitor.loading;
export const getJobsMonitorItemsLoaded = (state: RootState) => state.operations.jobsMonitor.loaded;

export const getJobsMonitoringItemsWithDescriptor = createSelector(
    [getJobsMonitorItems],
    (items) => {
        return filter_(items, ({monitoring_descriptor}) => Boolean(monitoring_descriptor));
    },
);

export const getJobsMonitorFromTo = createSelector(
    [getJobsMonitoringItemsWithDescriptor],
    (items) => {
        let from: number | undefined;
        let to: number | undefined;
        forEach_(items, ({start_time, finish_time}) => {
            if (start_time) {
                const start = moment(start_time).valueOf();
                from = min_([start, from]);
            }
            if (finish_time) {
                const finish = moment(finish_time).valueOf();
                to = max_([finish, to]);
            }
        });
        return {from, to};
    },
);

export const getJobsMonitorDescriptor = createSelector(
    [getJobsMonitoringItemsWithDescriptor],
    (jobs) => {
        const tmp = map_(jobs, 'monitoring_descriptor');
        return tmp.join('|');
    },
);

export const getJobsMonitorTabVisible = createSelector(
    [getOperationId, getJobsMonitorOperationId, getJobsMonitorDescriptor, getJobsMonitorError],
    (opId, jobMonId, jobsDescriptor, error) => {
        if (opId !== jobMonId) {
            return false;
        }
        if (!isEmpty_(error)) {
            return true;
        }

        return Boolean(jobsDescriptor);
    },
);
