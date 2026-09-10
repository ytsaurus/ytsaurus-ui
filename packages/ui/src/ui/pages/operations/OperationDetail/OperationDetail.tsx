import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../store/redux-hooks';
import {promptAction} from '../../../store/actions/actions';
import {showEditPoolsWeightsModal} from '../../../store/actions/operations';
import {getOperation} from '../../../store/actions/operations/detail';
import {
    selectIsOperationInGpuTree,
    selectOperationDetailsLoadingStatus,
    selectOperationErasedTrees,
    selectOperationPerformanceUrlTemplate,
} from '../../../store/selectors/operations/operation';

import {useAppRumMeasureStart} from '../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../utils/utils';

import UIFactory from '../../../UIFactory';
import {updateListJobsFilter} from '../../../store/actions/operations/jobs';
import {getOperationEvents, listOperationEventsApi} from '../../../store/api/yt';
import {type RootState} from '../../../store/reducers';
import {selectJobsMonitorTabVisible} from '../../../store/selectors/operations/jobs-monitor';
import {
    selectOperationStatisticsHasData,
    selectTotalCpuTimeSpent,
    selectTotalJobWallTime,
} from '../../../store/selectors/operations/statistics-v2';
import {selectCurrentCluster} from '../../../store/selectors/thor';
import {selectYsonSettingsDisableDecode} from '../../../store/selectors/thor/unipika';
import './OperationDetail.scss';

import {OperationDetailBase, type RouteProps} from './OperationDetailBase';

const mapStateToProps = (state: RootState, routerProps: RouteProps) => {
    const {operation, errorData, loading, loaded, error, actions, details} =
        state.operations.detail;
    const totalJobWallTime = selectTotalJobWallTime(state);
    const cpuTimeSpent = selectTotalCpuTimeSpent(state);
    const erasedTrees = selectOperationErasedTrees(state);
    const {runtime} = details;

    const {operationId} = routerProps.match.params;
    const {data: operationEvents} = getOperationEvents(state, {
        operation_id: operationId,
        event_type: 'incarnation_started',
    });

    const {
        component: monitoringComponent,
        urlTemplate: monitorTabUrlTemplate,
        title: monitorTabTitle,
    } = UIFactory.getMonitoringForOperation(operation) || {};

    const monitorTabVisible = Boolean(monitoringComponent) || Boolean(monitorTabUrlTemplate);

    return {
        cluster: selectCurrentCluster(state),
        operation,
        errorData,
        loading,
        loaded,
        error,
        actions,
        runtime,
        totalJobWallTime,
        cpuTimeSpent,
        erasedTrees,
        monitorTabVisible,
        monitorTabTitle,
        monitorTabUrlTemplate,
        monitoringComponent,
        timelineTabVisible: operation?.type === 'vanilla',
        jobsMonitorIsSupported: Boolean(UIFactory.getMonitorComponentForJob()),
        jobsMonitorVisible: selectJobsMonitorTabVisible(state),
        hasStatististicsTab: selectOperationStatisticsHasData(state),
        isGpuOperation: selectIsOperationInGpuTree(state),
        operationPerformanceUrlTemplate: selectOperationPerformanceUrlTemplate(state),
        operationEvents,
        ysonSettings: selectYsonSettingsDisableDecode(state),
    };
};

const mapDispatchToProps = {
    promptAction,
    getOperation,
    showEditPoolsWeightsModal,
    updateListJobsFilter,
    listOperationEvents: (operationId: string) =>
        listOperationEventsApi.endpoints.listOperationEvents.initiate({
            operation_id: operationId,
            event_type: 'incarnation_started',
        }),
};

const OperationDetailConnected = connect(mapStateToProps, mapDispatchToProps)(OperationDetailBase);

export default function OperationDetailsWithRum(props: RouteProps) {
    const loadState = useSelector(selectOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    return <OperationDetailConnected {...props} />;
}
