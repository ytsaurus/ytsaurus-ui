import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import debounce_ from 'lodash/debounce';
import {RootState} from '../../../../store/reducers';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {Action, Dispatch} from 'redux';
import {
    getCurrentQueryACO,
    getQueryAnnotations,
    getQueryDraft,
    getQueryItem,
} from '../query/selectors';
import {
    Config,
    FieldKey,
    VisualizationState,
    defaultVisualization,
    setConfig,
    setFiled,
    setLoading,
    setResultIndex,
    setSaved,
    setVisualization,
} from './queryChartSlice';
import {
    selectChartAxisType,
    selectChartConfig,
    selectChartVisualization,
    selectCurrentChartVisualization,
    selectQueryResult,
    selectQueryResults,
} from './selectors';
import {getPointValue} from '../../QueryResultsVisualization/preparers/getPointData';
import type {ChartKitWidgetAxisType} from '@gravity-ui/chartkit/build/types/widget-data/axis';
import {selectIsMultipleAco} from '../query_aco/selectors';
import cloneDeep_ from 'lodash/cloneDeep';
import {loadQueryResult} from '../query_result/actions';

const DELAY = 2 * 1000;

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const saveChartConfig = (dispatch: Dispatch, getState: () => RootState) => {
    dispatch(setSaved(false));
    const state = getState();
    const annotations = getQueryAnnotations(state);
    const isMultipleAco = selectIsMultipleAco(state);
    const aco = getCurrentQueryACO(state);
    const {id} = getQueryDraft(state);
    const config = selectChartVisualization(state);

    wrapApiPromiseByToaster(
        ytApiV4Id.alterQuery(YTApiId.alterQuery, {
            parameters: {
                query_id: id,
                ...(isMultipleAco
                    ? {access_control_objects: aco}
                    : {access_control_object: aco[0]}),
                annotations: {
                    ...annotations,
                    chartConfig: config,
                },
            },
        }),
        {
            toasterName: 'saveQueryChartConfig',
            skipSuccessToast: true,
            errorContent: 'Failed to save query chart config',
        },
    ).then(() => {
        dispatch(setSaved(true));
    });
};

const debouncedSaveQueryChartConfig = debounce_(saveChartConfig, DELAY);

export const saveQueryChartConfig = (): AsyncAction => (dispatch, getState) => {
    debouncedSaveQueryChartConfig(dispatch, getState);
};

export const changeAxisType =
    (axisType: ChartKitWidgetAxisType): AsyncAction =>
    (dispatch, getState) => {
        const state = getState();
        const result = selectQueryResult(state);
        const currentVisualization = selectCurrentChartVisualization(state);

        if (!currentVisualization) {
            return;
        }

        const {config, xField} = currentVisualization;

        const newConfig: Config = {
            ...config,
            xAxis: {
                title: config.xAxis.title,
                type: axisType,
                ...(axisType === 'category'
                    ? {categories: result.map((row) => getPointValue(row[xField]).toString())}
                    : {}),
            },
        };

        dispatch(setConfig(newConfig));
    };

export const changeField =
    (data: {value: string; oldValue: string; name: FieldKey}): AsyncAction =>
    (dispatch, getState) => {
        const type = selectChartAxisType(getState());

        dispatch(setFiled(data));
        dispatch(changeAxisType(type));
    };

export const changeConfig =
    ({
        name,
        value,
    }:
        | {name: 'legend'; value: boolean}
        | {name: 'title' | 'xTitle' | 'yTitle'; value: string}): AsyncAction =>
    (dispatch, getState) => {
        const state = getState();
        const config = selectChartConfig(state);

        if (!config) {
            return;
        }

        const newConfig = {...config};

        switch (name) {
            case 'title':
                newConfig.title = {text: value};
                break;
            case 'xTitle':
                newConfig.xAxis = {
                    ...newConfig.xAxis,
                    title: {text: value},
                };
                break;
            case 'yTitle':
                newConfig.yAxis = [{title: {text: value}}];
                break;
            case 'legend':
                newConfig.legend = {enabled: value};
                break;
        }

        dispatch(setConfig(newConfig));
    };

function isVisualizationState(config: any): config is VisualizationState {
    if (typeof config !== 'object' || config === null) {
        return false;
    }

    const requiredFields: Array<keyof VisualizationState> = ['type', 'xField', 'yField', 'config'];
    for (const field of requiredFields) {
        if (!(field in config)) {
            return false;
        }
    }

    return true;
}

const validateChartConfig = (config: any): config is Record<number, VisualizationState> => {
    if (typeof config !== 'object' || config === null) {
        return false;
    }

    return Object.values(config).every((value) => {
        return isVisualizationState(value);
    });
};

export const loadVisualization = (): AsyncAction => (dispatch, getState) => {
    const queryItem = getQueryItem(getState());
    const chartConfig = queryItem?.annotations?.chartConfig;

    dispatch(setResultIndex(0));
    if (validateChartConfig(chartConfig)) {
        dispatch(setVisualization(chartConfig));
    } else {
        dispatch(setVisualization({0: cloneDeep_(defaultVisualization)}));
    }
};

export const changeVisualizationResultIndex =
    (resultIndex: number): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const visualizations = selectChartVisualization(state);
        const results = selectQueryResults(state);
        const {id} = getQueryDraft(state);

        dispatch(setLoading(true));

        if (!id || !Object.keys(results).length) {
            dispatch(setLoading(false));
            return;
        }

        if (!visualizations[resultIndex]) {
            const newVisualizations = {
                ...visualizations,
                [resultIndex]: cloneDeep_(defaultVisualization),
            };
            dispatch(setVisualization(newVisualizations));
        }

        if (!(resultIndex in results)) {
            await dispatch(loadQueryResult(id, resultIndex));
        }

        dispatch(setLoading(false));
        dispatch(setResultIndex(resultIndex));
    };
