import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {ChartType} from '../../../pages/query-tracker/QueryResultsVisualization/constants';

export type Config = Pick<Required<ChartData>, 'title' | 'xAxis' | 'yAxis' | 'legend'>;

export type VisualizationState = {
    type: ChartType | null;
    xField: string;
    yField: string[];
    config: Config;
};

export type QueryResultsVisualizationState = {
    saved: boolean;
    loading: boolean;
    resultIndex: number;
    visualization: Record<number, VisualizationState>;
};

export type FieldKey = 'xField' | 'yField' | 'xType';

export const defaultVisualization: VisualizationState = {
    type: null,
    xField: '',
    yField: [],
    config: {
        title: {
            text: '',
        },
        xAxis: {
            type: 'linear',
            title: {
                text: '',
            },
        },
        yAxis: [
            {
                title: {
                    text: '',
                },
            },
        ],
        legend: {
            enabled: false,
        },
    },
};

export const initialState: QueryResultsVisualizationState = {
    saved: true,
    loading: false,
    resultIndex: 0,
    visualization: {},
};

const queryChartSlice = createSlice({
    initialState,
    name: 'queryChart',
    reducers: {
        setSaved: (state, {payload}: PayloadAction<boolean>) => {
            state.saved = payload;
        },
        setResultIndex: (state, {payload}: PayloadAction<number>) => {
            state.resultIndex = payload;
        },
        setConfig: (state, {payload}: PayloadAction<Config>) => {
            state.visualization[state.resultIndex].config = payload;
        },
        setLoading: (state, {payload}: PayloadAction<boolean>) => {
            state.loading = payload;
        },
        setFiled: (
            state,
            {payload}: PayloadAction<{value: string; oldValue: string; name: FieldKey}>,
        ) => {
            if (payload.name === 'xField') {
                state.visualization[state.resultIndex].xField = payload.value;
                return;
            }

            if (payload.value) {
                if (payload.oldValue) {
                    const newArray = state.visualization[state.resultIndex].yField.filter(
                        (field) => field !== payload.oldValue,
                    );
                    state.visualization[state.resultIndex].yField = [...newArray, payload.value];
                } else {
                    state.visualization[state.resultIndex].yField.push(payload.value);
                }
            } else {
                state.visualization[state.resultIndex].yField = state.visualization[
                    state.resultIndex
                ].yField.filter((field) => field !== payload.oldValue);
            }
        },
        setVisualizationType: (state, {payload}: PayloadAction<ChartType>) => {
            state.visualization[state.resultIndex].type = payload;
        },
        setVisualization: (
            state,
            {payload}: PayloadAction<QueryResultsVisualizationState['visualization']>,
        ) => {
            state.visualization = payload;
        },
    },
});

export const {
    setConfig,
    setLoading,
    setResultIndex,
    setSaved,
    setFiled,
    setVisualizationType,
    setVisualization,
} = queryChartSlice.actions;

export const queryChartReducer = queryChartSlice.reducer;
