import {type RootState} from '../../reducers';

type MonitorChartStuts = {[chartType: string]: boolean};

export const selectSchedulingMonitorChartStates = (state: RootState): MonitorChartStuts =>
    state.scheduling.scheduling.monitorChartStatus;
