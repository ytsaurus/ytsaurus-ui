import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {YTError} from '../../../../types';

export type JobOperationIncarnationsState = {
    loading: boolean;
    loaded: boolean;
    error: YTError | undefined;
    filter: string | undefined;
    availableValues: Array<string> | undefined;
    operationId: string;
};

export const initialState: JobOperationIncarnationsState = {
    loaded: false,
    loading: false,
    error: undefined,
    availableValues: [],
    operationId: '',
    filter: undefined,
};

const jobOperaionIncarnationSlice = createSlice({
    initialState,
    name: 'jobOperaionIncarnations',
    reducers: {
        onRequest(
            state,
            {payload}: PayloadAction<Pick<JobOperationIncarnationsState, 'operationId'>>,
        ) {
            const {operationId} = payload;
            return state.operationId && operationId !== state.operationId
                ? {...initialState, ...payload, error: undefined}
                : {...state, ...payload, error: undefined};
        },
        onFalure(state, {payload}: PayloadAction<Pick<JobOperationIncarnationsState, 'error'>>) {
            return {...state, loading: false, ...payload};
        },
        onSuccess(
            state,
            {payload}: PayloadAction<Pick<JobOperationIncarnationsState, 'availableValues'>>,
        ) {
            return {...state, ...payload, loaded: true, loading: true, error: undefined};
        },
        onReset() {
            return {...initialState};
        },
        setFilter(state, {payload}: PayloadAction<Pick<JobOperationIncarnationsState, 'filter'>>) {
            return {...state, ...payload};
        },
    },
});

export const jobOperaionIncarnationActions = jobOperaionIncarnationSlice.actions;
export default jobOperaionIncarnationSlice.reducer;
