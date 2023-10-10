import {RootState} from '../../reducers';

type MonitorChartStuts = {[chartType: string]: boolean};

export const getSchedulingMonitorChartStates = (state: RootState): MonitorChartStuts =>
    state.scheduling.scheduling.monitorChartStatus;
