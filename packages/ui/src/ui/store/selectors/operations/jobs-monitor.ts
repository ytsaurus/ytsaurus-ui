import filter_ from 'lodash/filter';
import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import max_ from 'lodash/max';
import min_ from 'lodash/min';

import moment from 'moment';
import {createSelector} from 'reselect';
import {type RootState} from '../../../store/reducers';
import {selectOperationId} from './operation';

export const selectJobsMonitorError = (state: RootState) => state.operations.jobsMonitor.error;
export const selectJobsMonitorOperationId = (state: RootState) =>
    state.operations.jobsMonitor.operation_id;
export const selectJobsMonitorItems = (state: RootState) => state.operations.jobsMonitor.jobs;
export const selectJobsMonitorItemsLoading = (state: RootState) =>
    state.operations.jobsMonitor.loading;
export const selectJobsMonitorItemsLoaded = (state: RootState) =>
    state.operations.jobsMonitor.loaded;

export const selectJobsMonitoringItemsWithDescriptor = createSelector(
    [selectJobsMonitorItems],
    (items) => {
        return filter_(items, ({monitoring_descriptor}) => Boolean(monitoring_descriptor));
    },
);

export const selectJobsMonitorFromTo = createSelector(
    [selectJobsMonitoringItemsWithDescriptor],
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

export const selectUniqueJobsMonitorDescriptors = createSelector(
    [selectJobsMonitoringItemsWithDescriptor],
    (jobs) => {
        const descriptors = new Set(map_(jobs, 'monitoring_descriptor'));
        return [...descriptors];
    },
);

export const selectJobsMonitorTabVisible = createSelector(
    [
        selectOperationId,
        selectJobsMonitorOperationId,
        selectUniqueJobsMonitorDescriptors,
        selectJobsMonitorError,
    ],
    (opId, jobMonId, jobsDescriptorArray, error) => {
        if (opId !== jobMonId) {
            return false;
        }
        if (!isEmpty_(error)) {
            return true;
        }

        return Boolean(jobsDescriptorArray.length);
    },
);
