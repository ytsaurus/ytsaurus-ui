import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type Interval = {from: number; to: number};

export type JobPhase = {
    phase: string;
    startTime: number;
};

export type JobEvent = {
    startTime: number;
    endTime: number;
    percent: number;
    state: string;
    phases: JobPhase[];
};

export type TimelineJob = {
    groupName: string;
    events: JobEvent[];
};

export type JobsTimelineState = {
    isLoading: boolean;
    jobsCountError: boolean;
    selectedJobId: string | null;
    jobs: Record<string, TimelineJob>;
    filter: string;
    interval?: Interval;
    eventsInterval: Interval;
};

const initialState: JobsTimelineState = {
    isLoading: false,
    jobsCountError: false,
    selectedJobId: null,
    jobs: {},
    filter: '',
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
        setJobsCountError(state, action: PayloadAction<boolean>) {
            state.jobsCountError = action.payload;
        },
        setSelectedJobId(state, action: PayloadAction<string | null>) {
            state.selectedJobId = action.payload;
        },
        setJobs(
            state,
            action: PayloadAction<{
                jobs: JobsTimelineState['jobs'];
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
    },
});

export const {setJobs, setJobsCountError, setSelectedJobId, setLoading, setInterval, setFilter} =
    jobsTimelineSlice.actions;

export const jobsTimelineReducer = jobsTimelineSlice.reducer;
