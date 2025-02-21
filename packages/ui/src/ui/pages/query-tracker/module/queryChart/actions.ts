import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import debounce_ from 'lodash/debounce';
import {RootState} from '../../../../store/reducers';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {Action, Dispatch} from 'redux';
import {getCurrentQueryACO, getQueryAnnotations, getQueryItem} from '../query/selectors';
import {
    Config,
    FieldKey,
    VisualizationState,
    initialState,
    setConfig,
    setFiled,
    setSaved,
    setVisualization,
} from './queryChartSlice';
import {
    selectChartAxisType,
    selectChartConfig,
    selectChartVisualization,
    selectQueryResult,
} from './selectors';
import {getPointValue} from '../../QueryResultsVisualization/preparers/getPointData';
import {ChartKitWidgetAxisType} from '@gravity-ui/chartkit/build/types/widget-data/axis';
import {selectIsMultipleAco} from '../query_aco/selectors';

const DELAY = 2 * 1000;

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

type SaveQueryChartConfigPayload = {
    state: VisualizationState;
    queryId: string;
};

const saveChartConfig = (
    dispatch: Dispatch,
    getState: () => RootState,
    payload: SaveQueryChartConfigPayload,
) => {
    dispatch(setSaved(false));
    const state = getState();
    const annotations = getQueryAnnotations(state);
    const isMultipleAco = selectIsMultipleAco(state);
    const aco = getCurrentQueryACO(state);

    wrapApiPromiseByToaster(
        ytApiV4Id.alterQuery(YTApiId.alterQuery, {
            parameters: {
                query_id: payload.queryId,
                ...(isMultipleAco
                    ? {access_control_objects: aco}
                    : {access_control_object: aco[0]}),
                annotations: {
                    ...annotations,
                    chartConfig: payload.state,
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

export const saveQueryChartConfig =
    (payload: SaveQueryChartConfigPayload): AsyncAction =>
    (dispatch, getState) => {
        debouncedSaveQueryChartConfig(dispatch, getState, payload);
    };

export const changeAxisType =
    (axisType: ChartKitWidgetAxisType): AsyncAction =>
    (dispatch, getState) => {
        const state = getState();
        const result = selectQueryResult(state);
        const {config, xField} = selectChartVisualization(state);

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

export const loadVisualization = (): AsyncAction => (dispatch, getState) => {
    const queryItem = getQueryItem(getState());

    dispatch(setVisualization(queryItem?.annotations?.chartConfig || initialState.visualization));
};
