import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ChartType} from '../../QueryResultsVisualization/constants';
import type {
    ChartKitWidgetAxisType,
    ChartKitWidgetData,
} from '@gravity-ui/chartkit/build/types/widget-data';

export type Config = {
    title: ChartKitWidgetData['title'];
    xAxis: ChartKitWidgetData['xAxis'] & {type: ChartKitWidgetAxisType};
    yAxis: ChartKitWidgetData['yAxis'];
    legend: ChartKitWidgetData['legend'];
};

export type VisualizationState = {
    type: ChartType | null;
    xField: string;
    yField: string[];
    config: Config;
};

export type QueryResultsVisualizationState = {
    saved: boolean;
    visualization: VisualizationState;
};

export type FieldKey = 'xField' | 'yField' | 'xType';

export const initialState: QueryResultsVisualizationState = {
    saved: true,
    visualization: {
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
    },
};

const queryChartSlice = createSlice({
    initialState,
    name: 'queryChart',
    reducers: {
        setSaved: (state, {payload}: PayloadAction<boolean>) => {
            state.saved = payload;
        },
        setConfig: (state, {payload}: PayloadAction<Config>) => {
            state.visualization.config = payload;
        },
        setFiled: (
            state,
            {payload}: PayloadAction<{value: string; oldValue: string; name: FieldKey}>,
        ) => {
            if (payload.name === 'xField') {
                state.visualization.xField = payload.value;
                return;
            }

            if (payload.value) {
                if (payload.oldValue) {
                    const newArray = state.visualization.yField.filter(
                        (field) => field !== payload.oldValue,
                    );
                    state.visualization.yField = [...newArray, payload.value];
                } else {
                    state.visualization.yField.push(payload.value);
                }
            } else {
                state.visualization.yField = state.visualization.yField.filter(
                    (field) => field !== payload.oldValue,
                );
            }
        },
        setVisualizationType: (state, {payload}: PayloadAction<ChartType>) => {
            return {
                ...state,
                visualization: {
                    ...initialState.visualization,
                    type: payload,
                },
            };
        },
        setVisualization: (state, {payload}: PayloadAction<VisualizationState>) => {
            state.visualization = payload;
        },
    },
});

export const {setConfig, setSaved, setFiled, setVisualizationType, setVisualization} =
    queryChartSlice.actions;

export const queryChartReducer = queryChartSlice.reducer;
