import {getSchedulingMonitorChartStates} from '../../selectors/scheduling/monitor';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {SCHEDULING_DATA_PARTITION} from '../../../constants/scheduling';

type SchedulingReducerAction = ThunkAction<any, RootState, any, any>;

export function setSchedulingMonitorChartState(v: {
    chartType: string;
    finalState: boolean;
}): SchedulingReducerAction {
    return (dispatch, getState) => {
        const {chartType, finalState} = v;
        const monitorChartStatus = {
            ...getSchedulingMonitorChartStates(getState()),
        };
        monitorChartStatus[chartType] = finalState;

        dispatch({
            type: SCHEDULING_DATA_PARTITION,
            data: {monitorChartStatus},
        });
    };
}
