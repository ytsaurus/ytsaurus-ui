import type {ChartSettings, Visualization} from '../../QueryResultsVisualization/types';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export type QueryResultsVisualizationState = {
    saved: boolean;
    visualization: Visualization;
};

export const initialVisualization: Visualization = {
    id: 'line',
    placeholders: [
        {
            id: 'x',
            field: '',
        },
        {
            id: 'y',
            field: '',
        },
        {
            id: 'colors',
            field: '',
        },
    ],
    chartSettings: {
        xAxis: {
            legend: 'on',
            labels: 'on',
            title: '',
            grid: 'on',
            pixelInterval: '',
        },
        yAxis: {
            labels: 'on',
            title: '',
            grid: 'on',
            pixelInterval: '',
        },
    },
};

export const initialState: QueryResultsVisualizationState = {
    saved: true,
    visualization: initialVisualization,
};

const queryChartSlice = createSlice({
    initialState,
    name: 'queryChart',
    reducers: {
        setSaved: (state, {payload}: PayloadAction<boolean>) => {
            state.saved = payload;
        },
        setField: (state, {payload}: PayloadAction<{placeholderId: string; fieldName: string}>) => {
            return {
                ...state,
                visualization: {
                    ...state.visualization,
                    placeholders: state.visualization.placeholders.map((placeholder) => {
                        if (placeholder.id === payload.placeholderId) {
                            return {
                                ...placeholder,
                                field: payload.fieldName,
                            };
                        }

                        return placeholder;
                    }),
                },
            };
        },
        removeField: (
            state,
            {payload}: PayloadAction<{placeholderId: string; fieldName: string}>,
        ) => {
            const placeholders = state.visualization.placeholders.map((placeholder) => {
                if (placeholder.id === payload.placeholderId) {
                    return {
                        ...placeholder,
                        field: '',
                    };
                }

                return placeholder;
            });

            return {
                ...state,
                visualization: {
                    ...state.visualization,
                    placeholders,
                },
            };
        },
        setChartSettings: (state, {payload}: PayloadAction<ChartSettings>) => {
            return {
                ...state,
                visualization: {
                    ...state.visualization,
                    chartSettings: payload,
                },
            };
        },
        setVisualization: (state, {payload}: PayloadAction<Visualization>) => {
            return {
                ...state,
                visualization: payload,
            };
        },
    },
});

export const {setSaved, setChartSettings, setField, removeField, setVisualization} =
    queryChartSlice.actions;

export const queryChartReducer = queryChartSlice.reducer;
