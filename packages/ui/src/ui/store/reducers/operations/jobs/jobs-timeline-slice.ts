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
    id: string;
    cookieId: number;
    allocationId?: string;
    groupName: string;
    events: JobEvent[];
    start_time: string;
    finish_time?: string;
    address: string;
};

export type JobsTimelineState = {
    isLoading: boolean;
    jobsCountError: boolean;
    selectedJob: string;
    jobs: TimelineJob[];
    filter: string;
    interval?: Interval;
    eventsInterval: Interval;
    error: undefined | Error;
};

const initialState: JobsTimelineState = {
    isLoading: false,
    jobsCountError: false,
    selectedJob: '',
    jobs: [],
    filter: '',
    interval: undefined,
    eventsInterval: {
        from: Infinity,
        to: 0,
    },
    error: undefined,
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
        setSelectedJob(state, action: PayloadAction<string>) {
            state.selectedJob = action.payload;
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
        setError(state, action: PayloadAction<Error | undefined>) {
            state.error = action.payload;
        },
    },
});

export const {
    setJobs,
    setJobsCountError,
    setSelectedJob,
    setLoading,
    setInterval,
    setFilter,
    setError,
} = jobsTimelineSlice.actions;

export const jobsTimelineReducer = jobsTimelineSlice.reducer;
