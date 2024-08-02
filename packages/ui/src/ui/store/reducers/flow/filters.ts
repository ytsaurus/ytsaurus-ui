import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type FlowFiltersState = {
    flowViewMode: FlowViewMode;
};

export const initialState: FlowFiltersState = {
    flowViewMode: 'graph',
};

export const FLOW_VIEW_MODES = [
    'graph',
    'computations',
    'workers',
    'monitoring',
    //'logs',
    'static_spec',
    'dynamic_spec',
] as const;

export type FlowViewMode = (typeof FLOW_VIEW_MODES)[number];

export const filtersSlice = createSlice({
    name: 'flow.filters',
    initialState,
    reducers: {
        setFlowViewMode(state, {payload}: PayloadAction<FlowViewMode>) {
            state.flowViewMode = payload;
        },
    },
});

export const {setFlowViewMode} = filtersSlice.actions;
export const filters = filtersSlice.reducer;
