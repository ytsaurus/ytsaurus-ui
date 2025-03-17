import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../../../store/reducers';

type OperationsWidgetsState = Record<
    string,
    {
        state: 'all' | 'running' | 'failed';
        responsible: 'me' | 'my-list';
    }
>;

const defaultWidgetState = {
    state: 'all' as const,
    responsible: 'me' as const,
};

const initialState: OperationsWidgetsState = {
    operation: {
        ...defaultWidgetState,
    },
};

export const operationsWidgetSlice = createSlice({
    name: 'operationsWidget',
    initialState,
    reducers: {
        setOperationsFilterState(
            state,
            {payload}: PayloadAction<{id: string; state: OperationsWidgetsState[string]['state']}>,
        ) {
            if (!state[payload.id]) {
                state[payload.id] = {...defaultWidgetState};
            }

            state[payload.id] = {
                ...state[payload.id],
                state: payload.state,
            };
        },
        setOperationsResponsibleType(
            state,
            {
                payload,
            }: PayloadAction<{
                id: string;
                responsible: OperationsWidgetsState[string]['responsible'];
            }>,
        ) {
            if (!state[payload.id]) {
                state[payload.id] = {...defaultWidgetState};
            }

            state[payload.id] = {
                ...state[payload.id],
                responsible: payload.responsible,
            };
        },
    },
    selectors: {
        selectOperationsState: (state, id: string) => state[id]?.state || defaultWidgetState.state,
        selectOperationsResponsibleType: (state, id: string) =>
            state[id]?.responsible || defaultWidgetState.responsible,
    },
});

export const {setOperationsFilterState, setOperationsResponsibleType} =
    operationsWidgetSlice.actions;
export const {selectOperationsState, selectOperationsResponsibleType} =
    operationsWidgetSlice.getSelectors((state: RootState) => state.dashboard2.operationsWidget);
export const operationsWidget = operationsWidgetSlice.reducer;
