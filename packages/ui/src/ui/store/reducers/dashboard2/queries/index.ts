import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {RootState} from '../../../../store/reducers';

type QueriesWidgetState = {
    state?: string;
    engine?: string;
};

const initialState: QueriesWidgetState = {};

export const queriesWidgetSlice = createSlice({
    name: 'queriesWidget',
    initialState,
    reducers: {
        setQueriesState(state, {payload}: PayloadAction<Pick<QueriesWidgetState, 'state'>>) {
            return {...state, state: payload.state?.toLowerCase()};
        },
        setQueriesEngine(state, {payload}: PayloadAction<Pick<QueriesWidgetState, 'engine'>>) {
            return {...state, engine: payload.engine?.toLowerCase()};
        },
    },
    selectors: {
        selectQueriesState: (state) => state.state,
        selectQueriesEngine: (state) => state.engine,
    },
});

export const {setQueriesState, setQueriesEngine} = queriesWidgetSlice.actions;
export const {selectQueriesState, selectQueriesEngine} = queriesWidgetSlice.getSelectors(
    (state: RootState) => state.dashboard2.queriesWidget,
);

export const queriesWidget = queriesWidgetSlice.reducer;
