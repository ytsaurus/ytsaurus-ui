import {createSlice} from '@reduxjs/toolkit';

export type FlowFiltersState = {
    pipelinePath: string;
};

export const initialState: FlowFiltersState = {
    pipelinePath: '',
};

export const FlowTab = {
    GRAPH: 'graph',
    GRAPH_DATA: 'graph_data',
    COMPUTATIONS: 'computations',
    WORKERS: 'workers',
    MONITORING: 'monitoring',
    STATIC_SPEC: 'static_spec',
    DYNAMIC_SPEC: 'dynamic_spec',
} as const;

export type FlowTabType = (typeof FlowTab)[keyof typeof FlowTab];

export const filtersSlice = createSlice({
    name: 'flow.filters',
    initialState,
    reducers: {},
});

export const filters = filtersSlice.reducer;
