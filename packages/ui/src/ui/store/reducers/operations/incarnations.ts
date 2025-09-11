import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import type {OperationEvent} from '../../../../shared/yt-types';

import {listOperationEventsApi} from '../../../store/api/yt';
import type {Incarnation} from '../../../store/selectors/operations/incarnations';

import {RootState} from '..';

type IncarnationsState = {
    idFilter?: string;
    incarnationsList?: Array<OperationEvent>;
    infoDialog?: {
        incarnation: Incarnation;
    } | null;
};

const incarnationsSlice = createSlice({
    name: 'incarnations',
    initialState: {
        showInfoDialog: false,
    } as IncarnationsState,
    reducers: {
        setIdFilter: (state, {payload}: PayloadAction<Pick<IncarnationsState, 'idFilter'>>) => ({
            ...state,
            idFilter: payload.idFilter,
        }),
        setIncarnationsList: (
            state,
            {payload}: PayloadAction<Pick<IncarnationsState, 'incarnationsList'>>,
        ) => ({
            ...state,
            incarnationsList: payload.incarnationsList,
        }),
        toggleIncarnationInfoDialog: (
            state,
            {payload}: PayloadAction<Pick<IncarnationsState, 'infoDialog'>>,
        ) => ({...state, infoDialog: payload.infoDialog}),
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            listOperationEventsApi.endpoints.listOperationEvents.matchFulfilled,
            (state, {payload}) => {
                state.incarnationsList = payload;
            },
        );
    },
    selectors: {
        getIdFilter: (state) => state.idFilter,
        getIncarnationsList: (state) => state.incarnationsList,
        getIncarnationInfoDialog: (state) => state.infoDialog,
    },
});

export const incarnations = incarnationsSlice.reducer;
export const {setIdFilter, setIncarnationsList, toggleIncarnationInfoDialog} =
    incarnationsSlice.actions;
export const {getIdFilter, getIncarnationsList, getIncarnationInfoDialog} =
    incarnationsSlice.getSelectors((state: RootState) => state.operations.incarnations);
