import React from 'react';
import {useDispatch} from 'react-redux';
import {GET_OPERATION} from '../../../../../constants/operations/detail';
import {OperationDetailSuccessActionData} from '../../../../../store/reducers/operations/detail';
import {JobLogs} from '../JobLogs';

export const operationData: OperationDetailSuccessActionData = {
    operation: {
        finishTime: '2024-01-15T11:55:00Z',
        id: '123',
        $typedAttributes: undefined,
        live_preview: undefined,
        getLivePreviewPath: () => ({path: '', virtualPath: ''}),
        $value: '',
        $attributes: undefined,
        state: 'completed',
        pools: [],
        isRunning: () => false,
        isPreparing: () => false,
        inIntermediateState: () => false,
        successfullyCompleted: () => true,
        computePools: () => {},
    },
    actions: [],
    details: {
        alert_events: [],
        runtime: undefined,
        specification: undefined,
        resources: undefined,
        error: undefined,
        events: undefined,
        intermediateResources: undefined,
    },
};

export function JobLogsWithStore() {
    const dispatch = useDispatch();
    dispatch({
        type: GET_OPERATION.SUCCESS,
        data: operationData,
    });
    return (
        <div style={{height: '200px'}}>
            <JobLogs />
        </div>
    );
}
