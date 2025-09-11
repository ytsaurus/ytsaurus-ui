import React from 'react';
import {useDispatch} from 'react-redux';

import {GET_OPERATION} from '../../../../../../constants/operations/detail';
import {listOperationEventsApi} from '../../../../../../store/api/yt';

import {operationData} from '../__stories__/mocks';

export function IncarnationsWithRequests({component}: {component: React.ReactNode}) {
    const dispatch = useDispatch();
    dispatch(
        listOperationEventsApi.endpoints.listOperationEvents.initiate({
            operation_id: operationData.operation.id,
            event_type: 'incarnation_started',
        }),
    );
    dispatch({
        type: GET_OPERATION.SUCCESS,
        data: operationData,
    });
    return component;
}
