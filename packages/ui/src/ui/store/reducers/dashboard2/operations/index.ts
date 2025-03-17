import {PayloadAction, createSlice} from '@reduxjs/toolkit';

type OperationsWidgetState = {
    state: 'all' | 'running' | 'failed';
};

const initialState: OperationsWidgetState = {
    state: 'all',
};

const operationsWidgetSlice = createSlice({
    name: 'operationsWidget',
    initialState,
    reducers: {
        setOperationsFilterState(state, {payload}: PayloadAction<OperationsWidgetState>) {
            return {...state, state: payload.state};
        },
    },
});

export const {setOperationsFilterState} = operationsWidgetSlice.actions;
export const operationsWidget = operationsWidgetSlice.reducer;
