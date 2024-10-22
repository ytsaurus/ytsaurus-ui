import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {Visualization} from '../../QueryResultsVisualization/types';
import debounce_ from 'lodash/debounce';
import {initialVisualization, setSaved, setVisualization} from './queryChartSlice';
import {RootState} from '../../../../store/reducers';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {ThunkAction} from 'redux-thunk';
import {Action, Dispatch} from 'redux';
import {getQueryItem} from '../query/selectors';

const DELAY = 5 * 1000;

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

type SaveQueryChartConfig = {
    visualization: Visualization;
    queryId: string;
};

const saveChartConfig = (dispatch: Dispatch, chartConfig: SaveQueryChartConfig) => {
    dispatch(setSaved(false));
    wrapApiPromiseByToaster(
        ytApiV4Id.alterQuery(YTApiId.alterQuery, {
            parameters: {
                query_id: chartConfig.queryId,
                annotations: {
                    chartConfig: chartConfig.visualization,
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
    (payload: SaveQueryChartConfig): AsyncAction =>
    (dispatch) => {
        debouncedSaveQueryChartConfig(dispatch, payload);
    };

export const loadVisualization = (): AsyncAction => (dispatch, getState) => {
    const queryItem = getQueryItem(getState());

    dispatch(setVisualization(queryItem?.annotations?.chartConfig || initialVisualization));
};
