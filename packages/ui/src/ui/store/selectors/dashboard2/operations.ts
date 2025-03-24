import {RootState} from '../../../store/reducers';

export const getOperationsFilterState = (state: RootState) =>
    state.dashboard2.operationsWidget.state;
