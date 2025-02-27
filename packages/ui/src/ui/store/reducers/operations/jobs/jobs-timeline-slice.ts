import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {RawJobEvent} from '../../../../types/operations/job';

export type Interval = {from: number; to: number};

export type JobsTimelineState = {
    isLoading: boolean;
    events: Record<string, RawJobEvent[]>;
    filter: string;
    shortcut?: string;
    interval?: Interval;
    eventsInterval: Interval;
};

const initialState: JobsTimelineState = {
    isLoading: false,
    events: {},
    filter: '',
    shortcut: undefined,
    interval: undefined,
    eventsInterval: {
        from: Infinity,
        to: 0,
    },
};

const jobsTimelineSlice = createSlice({
    name: 'jobsTimeline',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setEvents(
            state,
            action: PayloadAction<{
                events: JobsTimelineState['events'];
                eventsInterval: JobsTimelineState['eventsInterval'];
            }>,
        ) {
            return {
                ...state,
                ...action.payload,
            };
        },
        setFilter(state, action: PayloadAction<JobsTimelineState['filter']>) {
            state.filter = action.payload;
        },
        setInterval(state, action: PayloadAction<Interval>) {
            state.interval = action.payload;
        },
        setShortcut(state, action: PayloadAction<string>) {
            state.shortcut = action.payload;
        },
    },
});

export const {setEvents, setLoading, setShortcut, setInterval, setFilter} =
    jobsTimelineSlice.actions;

export const jobsTimelineReducer = jobsTimelineSlice.reducer;
