import _ from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';
import ypath from '../../../common/thor/ypath';
import {calculateLoadingStatus} from '../../../utils/utils';
import {FIX_MY_TYPE} from '../../../types';

const getOperationErasedTreesRaw = (state: RootState) => {
    return ypath.getValue(state.operations.detail, '/operation/@runtime_parameters/erased_trees');
};

export const getOperationErasedTrees = createSelector(
    [getOperationErasedTreesRaw],
    (rawTrees: Array<unknown>) => {
        return _.reduce(
            rawTrees,
            (acc, item) => {
                const poolTree = ypath.getValue(item);
                acc[poolTree] = true;
                return acc;
            },
            {} as {[poolTree: string]: boolean},
        );
    },
);

interface OperationTask {
    task_name: string;
}

const getOperationAlertEvents = (state: RootState) => state.operations.detail.details.alert_events;

export const getOperation = (state: RootState) => state.operations.detail.operation;
export const getOperationId = (state: RootState) =>
    ypath.getValue(state.operations.detail.operation);
export const getOperationTasks = createSelector(
    [getOperation],
    (operation): Array<OperationTask> | undefined => {
        return ypath.getValue(operation, '/@progress/tasks');
    },
);
export const getOperationTasksNames = createSelector(
    [getOperationTasks],
    (tasks?: Array<{task_name: string}>) => {
        return _.map(tasks, 'task_name').sort();
    },
);

export const getOperationDetailsLoadingStatus = createSelector(
    [
        (state: RootState) => (state.operations.detail as FIX_MY_TYPE).loading,
        (state: RootState) => (state.operations.detail as FIX_MY_TYPE).loaded,
        (state: RootState) => (state.operations.detail as FIX_MY_TYPE).error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export const getOperationTypedAttributes = (state: RootState) =>
    (state.operations.detail.operation as FIX_MY_TYPE).$typedAttributes;

export const getOperationMonitorChartStates = (state: RootState) =>
    state.operations.detail.monitorChartStates;

export const getOperationPools = (state: RootState) =>
    (state.operations.detail.operation as FIX_MY_TYPE).pools;

export const getOperationPoolNames = createSelector([getOperationPools], (pools): Array<string> => {
    return _.map(pools, 'pool');
});

export const getOperationsMonitorChartStatesFinishedCount = createSelector(
    [getOperationMonitorChartStates],
    (states) => {
        return _.reduce(
            states,
            (acc, value) => {
                return value ? acc + 1 : acc;
            },
            0,
        );
    },
);

export const getOperationJobsLoadingStatus = createSelector(
    [
        (state: RootState) => (state.operations.jobs as FIX_MY_TYPE).loading,
        (state: RootState) => (state.operations.jobs as FIX_MY_TYPE).loaded,
        (state: RootState) => (state.operations.jobs as FIX_MY_TYPE).error,
    ],
    (loading, loaded, error) => {
        return calculateLoadingStatus(loading, loaded, error);
    },
);

export interface OperationExperimentItem {
    experiment: string;
    group: string;
    ticket: string;
    dimension: string;
    effect: unknown;
}

export const getOperationExperimentAssignments = createSelector(
    [getOperation],
    (operation): Array<OperationExperimentItem> => {
        return ypath.getValue(operation, '/@experiment_assignments');
    },
);

const getOperationMonitoredJobCount = createSelector([getOperation], (operation) => {
    const res = ypath.getNumberDeprecated(
        operation,
        '/@brief_progress/registered_monitoring_descriptor_count',
    );
    return res;
});

export const getOperationJobsMonitorTabSettings = createSelector(
    [getOperationMonitoredJobCount],
    (jobsCount) => {
        const maxJobCount = 200;
        return {visible: jobsCount > 0 && jobsCount <= maxJobCount, maxJobCount};
    },
);

export const getOperationAlertEventsItems = createSelector(
    [getOperationAlertEvents],
    (alertEvents) => {
        return alertEvents;
    },
);
