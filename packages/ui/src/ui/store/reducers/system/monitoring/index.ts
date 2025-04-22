import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {injectReducers, nameAndInitialState} from '../../../../store/window-store';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../../constants/utils';

export type SystemMonitoringState = {
    activeTab: string | undefined;
    masterLocalContainer: string | undefined;
};

export const persistentState: Pick<SystemMonitoringState, 'activeTab'> = {
    activeTab: undefined,
};

export const ephemeralState: Omit<SystemMonitoringState, keyof typeof persistentState> = {
    masterLocalContainer: undefined,
};

const initialState: SystemMonitoringState = {...persistentState, ...ephemeralState};

export const slice = createSlice({
    ...nameAndInitialState('systemMonitoring', initialState),
    reducers: {
        onUpdate: (state, {payload}: PayloadAction<Partial<SystemMonitoringState>>) => {
            return {...state, ...payload};
        },
    },
    selectors: {
        getActiveTab: (state) => state.activeTab,
        getMasterLocalContainer: (state) => state.masterLocalContainer,
    },
    extraReducers: (arg) => {
        arg.addCase(
            RESET_STORE_BEFORE_CLUSTER_CHANGE,
            mergeStateOnClusterChange(ephemeralState, persistentState, slice.reducer),
        );
    },
});

export const systemMonitoring = injectReducers(slice.name, slice);
