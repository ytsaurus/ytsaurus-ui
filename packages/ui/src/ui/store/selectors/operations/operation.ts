import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {createSelector} from 'reselect';

import {formatByParams} from '../../../../shared/utils/format';
import {RootState} from '../../../store/reducers';
import ypath from '../../../common/thor/ypath';
import {AlertInfo} from '../../../components/AlertEvents/AlertEvents';
import {calculateLoadingStatus} from '../../../utils/utils';
import {FIX_MY_TYPE} from '../../../types';
import {prepareFaqUrl} from '../../../utils/operations/tabs/details/alerts';
import {getClusterUiConfig} from '../global';

const getOperationErasedTreesRaw = (state: RootState) => {
    return ypath.getValue(state.operations.detail, '/operation/@runtime_parameters/erased_trees');
};

export const getOperationErasedTrees = createSelector(
    [getOperationErasedTreesRaw],
    (rawTrees: Array<unknown>) => {
        return reduce_(
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

const getOperationAlertEventsImpl = (state: RootState) =>
    state.operations.detail.details.alert_events;

export const getOperationAlertEvents = createSelector([getOperationAlertEventsImpl], (items) => {
    const appeared: Record<string, AlertInfo> = {};
    return reduce_(
        items,
        (acc, item) => {
            const type = ypath.getValue(item.alert_type);
            const code = ypath.getNumberDeprecated(item, '/error/code', NaN);
            if (!code && appeared[type]) {
                const last = appeared[type];
                last.to = ypath.getValue(item.time);
                delete appeared[type];
            } else if (code) {
                acc.push({
                    from: ypath.getValue(item.time),
                    type,
                    error: item.error,
                    url: prepareFaqUrl(type),
                });
                appeared[type] = acc[acc.length - 1];
            } else {
                acc.push({
                    to: ypath.getValue(item.time),
                    type,
                    error: item.error,
                    url: prepareFaqUrl(type),
                });
            }
            return acc;
        },
        [] as Array<AlertInfo>,
    );
});

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
        return map_(tasks, 'task_name').sort();
    },
);

export const getOperationTreeConfigs = (state: RootState) => state.operations.detail.treeConfigs;

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
    return map_(pools, 'pool');
});

export const getOperationsMonitorChartStatesFinishedCount = createSelector(
    [getOperationMonitorChartStates],
    (states) => {
        return reduce_(
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

export const getOperationMonitoredJobCount = createSelector([getOperation], (operation) => {
    const res = ypath.getNumberDeprecated(
        operation,
        '/@brief_progress/registered_monitoring_descriptor_count',
    );
    return res;
});

export const selectIsOperationInGpuTree = createSelector(
    [getOperationTreeConfigs],
    (treeConfigs) => {
        return treeConfigs?.every((item) => item.config.main_resource === 'gpu');
    },
);

export const getOperationPerformanceUrlTemplate = createSelector(
    [getOperationId, getClusterUiConfig],
    (operationId, uiConfig) => {
        const operationPerformanceUrlTemplate = uiConfig?.operation_performance_url_template;

        if (!operationPerformanceUrlTemplate) return undefined;

        return {
            url: formatByParams(operationPerformanceUrlTemplate.url_template, {
                operation_id: operationId,
            }),
            title: operationPerformanceUrlTemplate.title,
        };
    },
);
