import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../../../store/reducers';

export enum OperationStateFilter {
    PENDING = 'pending',
    COMPLETED = 'completed',
    RUNNING = 'running',
    FAILED = 'failed',
    ABORTED = 'aborted',
    ALL = 'all',
}
type OperationsWidgetsState = Record<
    string,
    {
        stateFilter: OperationStateFilter;
        usersTypeFilter: 'me' | 'my-list';
    }
>;

const defaultWidgetState = {
    stateFilter: OperationStateFilter.ALL,
    usersTypeFilter: 'my-list' as const,
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
        setOperationsStateFilter(
            state,
            {
                payload,
            }: PayloadAction<{id: string; state: OperationsWidgetsState[string]['stateFilter']}>,
        ) {
            if (!state[payload.id]) {
                return {
                    ...state,
                    [payload.id]: {
                        ...defaultWidgetState,
                    },
                };
            }

            return {
                ...state,
                [payload.id]: {
                    ...state[payload.id],
                    stateFilter: payload.state,
                },
            };
        },
        setOperationsUsersTypeFilter(
            state,
            {
                payload,
            }: PayloadAction<{
                id: string;
                users: OperationsWidgetsState[string]['usersTypeFilter'];
            }>,
        ) {
            if (!state[payload.id]) {
                return {
                    ...state,
                    [payload.id]: {
                        ...defaultWidgetState,
                    },
                };
            }

            return {
                ...state,
                [payload.id]: {
                    ...state[payload.id],
                    usersTypeFilter: payload.users,
                },
            };
        },
    },
    selectors: {
        getOperationsStateFilter: (state, id: string) =>
            state?.[id]?.stateFilter || defaultWidgetState.stateFilter,
        getOperationsUsersTypeFilter: (state, id: string) =>
            state?.[id]?.usersTypeFilter || defaultWidgetState.usersTypeFilter,
    },
});

export const {setOperationsStateFilter, setOperationsUsersTypeFilter} =
    operationsWidgetSlice.actions;
export const {getOperationsStateFilter, getOperationsUsersTypeFilter} =
    operationsWidgetSlice.getSelectors((state: RootState) => state.dashboard2.operationsWidget);
export const operationsWidget = operationsWidgetSlice.reducer;
