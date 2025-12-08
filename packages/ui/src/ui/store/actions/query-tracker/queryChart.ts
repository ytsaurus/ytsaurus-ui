import debounce_ from 'lodash/debounce';
import {RootState} from '../../reducers';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {
    getCurrentQueryACO,
    getQueryAnnotations,
    getQueryDraft,
    getQueryItem,
} from '../../selectors/query-tracker/query';
import {getCurrentUserName} from '../../selectors/global/username';
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
} from '../../reducers/query-tracker/queryChartSlice';
import {
    selectChartAxisType,
    selectChartConfig,
    selectChartVisualization,
    selectCurrentChartVisualization,
    selectQueryResult,
    selectQueryResults,
} from '../../selectors/query-tracker/queryChart';
import {getPointValue} from '../../../pages/query-tracker/QueryResultsVisualization/preparers/getPointData';
import type {ChartAxisType} from '@gravity-ui/chartkit/gravity-charts';
import cloneDeep_ from 'lodash/cloneDeep';
import {loadQueryResult} from './queryResult';
import {alterQueryChartConfig} from './api';
import {AppDispatch} from '../../store.main';

const DELAY = 2 * 1000;

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const saveChartConfig = (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const currentUser = getCurrentUserName(state);
    const queryItem = getQueryItem(state);
    const {id} = getQueryDraft(state);

    if (!queryItem || currentUser !== queryItem.user || !id) {
        return;
    }

    dispatch(setSaved(false));

    const annotations = getQueryAnnotations(state);
    const aco = getCurrentQueryACO(state);
    const chartConfig = selectChartVisualization(state);

    wrapApiPromiseByToaster(
        dispatch(
            alterQueryChartConfig({
                query_id: id,
                aco,
                annotations,
                chartConfig,
            }),
        ),
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
    (axisType: ChartAxisType): AsyncAction =>
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
        dispatch(changeAxisType(type!));
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
