import isEmpty_ from 'lodash/isEmpty';
import isPlainObject_ from 'lodash/isPlainObject';

import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {
    type FlowPartitionJobStateType,
    type FlowPartitionStateType,
    type FlowStateTarget,
} from '../../../../shared/yt-types';

export type FlowStateFiltersValue = {
    computationId?: string;
    partitionId?: string;
    keyValues: Record<string, string>;
    rawKey?: unknown;
    stateName?: string;
    target: FlowStateTarget;
};

export function normalizeFlowStateRawKey(value: unknown): unknown {
    if ((isPlainObject_(value) || Array.isArray(value)) && isEmpty_(value)) {
        return undefined;
    }
    return value;
}

export type FlowFiltersState = {
    pipelinePath: string;

    computationsNameFilter: string;
    workersNameFilter: string;

    currentComputation: string;
    partitionIdFilter: string;

    currentWorker: string;

    currentPartition: string;

    partitionsJobStateFilter: Array<FlowPartitionJobStateType>;
    partitionsStateFilter: Array<FlowPartitionStateType>;

    zoomToNode: string;

    stateViewer: FlowStateFiltersValue;
};

export const initialState: FlowFiltersState = {
    pipelinePath: '',

    computationsNameFilter: '',
    workersNameFilter: '',

    currentComputation: '',
    partitionIdFilter: '',

    currentWorker: '',

    currentPartition: '',

    partitionsJobStateFilter: [],
    partitionsStateFilter: [],

    zoomToNode: '',

    stateViewer: {keyValues: {}, target: 'all'},
};

export const FlowTab = {
    GRAPH: 'graph',
    COMPUTATIONS: 'computations',
    WORKERS: 'workers',
    MONITORING: 'monitoring',
    LOGS: 'logs',
    STATE: 'state',
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
            if (action.payload.stateViewer) {
                state.stateViewer.rawKey = normalizeFlowStateRawKey(state.stateViewer.rawKey);
            }
        },
    },
});

export const filters = filtersSlice.reducer;
