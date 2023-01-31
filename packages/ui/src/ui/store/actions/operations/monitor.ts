import {OPERATION_DETAIL_PARTIAL} from '../../../constants/operations/detail';
import {getOperationMonitorChartStates} from '../../../store/selectors/operations/operation';
import {ThunkAction} from 'redux-thunk';

export function resetOperationmonitorChartStates() {
    return {type: OPERATION_DETAIL_PARTIAL, data: {monitorChartStates: {}}};
}

export function updateOperationMonitorChartStates(states: {
    [name: string]: boolean;
}): ThunkAction<any, any, any, any> {
    return (dispatch, getState) => {
        const old = getOperationMonitorChartStates(getState());
        return dispatch({
            type: OPERATION_DETAIL_PARTIAL,
            data: {monitorChartStates: {...old, ...states}},
        });
    };
}
