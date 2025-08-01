import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RootState} from '..';

type IncarnationsState = {
    idFilter?: string;
    showOnlyWithTelemetry?: boolean;
};

const incarnationsSlice = createSlice({
    name: 'incarnations',
    initialState: {} as IncarnationsState,
    reducers: {
        setIdFilter: (state, {payload}: PayloadAction<Pick<IncarnationsState, 'idFilter'>>) => ({
            ...state,
            idFilter: payload.idFilter,
        }),
        setShowOnlyWithTelemetry: (
            state,
            {payload}: PayloadAction<Pick<IncarnationsState, 'showOnlyWithTelemetry'>>,
        ) => ({
            ...state,
            showOnlyWithTelemetry: payload.showOnlyWithTelemetry,
        }),
    },
    selectors: {
        getShowOnlyWithTelenetry: (state) => state.showOnlyWithTelemetry,
        getIdFilter: (state) => state.idFilter,
    },
});

export const incarnations = incarnationsSlice.reducer;
export const {setIdFilter, setShowOnlyWithTelemetry} = incarnationsSlice.actions;
export const {getShowOnlyWithTelenetry, getIdFilter} = incarnationsSlice.getSelectors(
    (state: RootState) => state.operations.incarnations,
);
