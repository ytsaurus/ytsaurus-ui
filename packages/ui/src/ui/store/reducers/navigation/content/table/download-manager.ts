import {produce} from 'immer';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import moment, {Moment} from 'moment';
import {CanceledError} from 'axios';

import {YTError} from '../../../../../../@types/types';

interface DownloadItem {
    id: string;
    startTime: Moment;

    loading?: boolean;
    loaded?: boolean;

    error?: YTError | CanceledError<any>;
}

export interface DownloadManagerState {
    downloads: {[key: string]: DownloadItem};
}

const initialState: DownloadManagerState = {
    downloads: {},
};

const reducers = {
    onRequest(state: DownloadManagerState, action: PayloadAction<Pick<DownloadItem, 'id'>>) {
        return produce(state, (state: DownloadManagerState) => {
            state.downloads[action.payload.id] = {
                ...state.downloads[action.payload.id],
                startTime: moment(),
                loading: true,
                loaded: false,
            };
        });
    },
    onFailure(
        state: DownloadManagerState,
        action: PayloadAction<Pick<DownloadItem, 'id' | 'error'>>,
    ) {
        return produce(state, (state: DownloadManagerState) => {
            state.downloads[action.payload.id] = {
                ...state.downloads[action.payload.id],
                error: action.payload.error,
                loaded: false,
                loading: false,
            };
        });
    },
    onSuccess(state: DownloadManagerState, action: PayloadAction<Pick<DownloadItem, 'id'>>) {
        return produce(state, (state: DownloadManagerState) => {
            state.downloads[action.payload.id] = {
                ...state.downloads[action.payload.id],
                loading: false,
                loaded: true,
            };
        });
    },
    onCleanup(state: DownloadManagerState, action: PayloadAction<Pick<DownloadItem, 'id'>>) {
        return produce(state, (state: DownloadManagerState) => {
            delete state.downloads[action.payload.id];
        });
    },
};

const downloadManagerSlice = createSlice({
    name: 'downloadManager',
    initialState,
    reducers,
});

export const downloadManagerActions = downloadManagerSlice.actions;
export const downloadManager = downloadManagerSlice.reducer;
