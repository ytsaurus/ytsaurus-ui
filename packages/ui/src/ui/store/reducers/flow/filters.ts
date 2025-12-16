import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type FlowFiltersState = {
    pipelinePath: string;

    computationsNameFilter: string;
    workersNameFilter: string;

    currentComputation: string;
    partitionIdFilter: string;
};

export const initialState: FlowFiltersState = {
    pipelinePath: '',

    computationsNameFilter: '',
    workersNameFilter: '',

    currentComputation: '',

    partitionIdFilter: '',
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
    reducers: {
        updateFlowFilters: (state, action: PayloadAction<Partial<FlowFiltersState>>) => {
            Object.assign(state, action.payload);
        },
    },
});

export const filters = filtersSlice.reducer;
