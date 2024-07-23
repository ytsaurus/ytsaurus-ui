import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {Visualization} from '../types';

import debounce_ from 'lodash/debounce';
import type {QueryResultVisualizationAction} from './reducer';
import {QueryResultMetaScheme, getQueryResultMeta, readQueryResults} from '../../module/api';
import {getPrimitiveTypesMap} from '../../../../store/selectors/global/supported-features';
import thorYPath from '../../../../common/thor/ypath';
import {getType} from '../../../../components/SchemaDataType/dataTypes';
import {Type, parseV3Type} from '../../../../components/SchemaDataType/dateTypesV3';
import {getQueryResultGlobalSettings} from '../../module/query_result/selectors';
import {prepareFormattedValue} from '../../module/query_result/utils/format';
import {selectQueryResult} from './selectors';
import {RootState} from '../../../../store/reducers/index';
import {AppThunkDispatch} from '../../../../store/thunkDispatch';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';

type SaveQueryChartConfig = {
    visualizations: Visualization[];
    queryId: string;
};

const DELAY = 5 * 1000;

const debouncedSaveQueryChartConfig = debounce_(
    (dispatch: AppThunkDispatch<QueryResultVisualizationAction>, payload: SaveQueryChartConfig) => {
        const promise = ytApiV4Id
            .alterQuery(YTApiId.alterQuery, {
                parameters: {
                    query_id: payload.queryId,
                    annotations: {
                        ui_chart_config: payload.visualizations,
                    },
                },
            })
            .then(() => {
                dispatch({
                    type: 'set-visualization-saved',
                    data: {
                        saved: true,
                    },
                });
            });

        wrapApiPromiseByToaster(promise, {
            toasterName: 'saveQueryChartConfig',
            skipSuccessToast: true,
            errorContent: 'Failed to save query chart config',
        });
    },
    DELAY,
);

export function saveQueryChartConfig(payload: SaveQueryChartConfig) {
    return (dispatch: AppThunkDispatch<QueryResultVisualizationAction>) => {
        dispatch({
            type: 'set-visualization-saved',
            data: {
                saved: false,
            },
        });

        debouncedSaveQueryChartConfig(dispatch, payload);
    };
}

export function newbiusLoadQueryResults({
    queryId,
    resultIndex,
}: {
    queryId: string;
    resultIndex: number;
}) {
    return async (dispatch: AppThunkDispatch<any>, getState: () => RootState) => {
        const queryResultAlreadyExist = selectQueryResult(getState());

        if (queryResultAlreadyExist) {
            return;
        }

        const meta = await dispatch(getQueryResultMeta(queryId, resultIndex));

        if (meta?.error) throw meta.error;

        const typeMap = getPrimitiveTypesMap(getState());
        const scheme: QueryResultMetaScheme[] = thorYPath.getValue(meta?.schema) || [];
        const columns =
            scheme.map(({name, type_v3: typeV3}) => {
                return {
                    name,
                    type: getType(parseV3Type(typeV3 as Type, typeMap)),
                    displayName: name,
                };
            }) || [];

        const settings = getQueryResultGlobalSettings();

        const result = await dispatch(
            readQueryResults(
                queryId,
                resultIndex,
                {
                    start: 0,
                    end: Infinity,
                },
                columns.map(({name}) => name),
                {cellsSize: settings.cellSize},
            ),
        );

        const {rows, yql_type_registry: types} = result;

        const queryResult = rows.map((v) => {
            return Object.entries(v).reduce(
                (acc, [k, [value, typeIndex]]) => {
                    acc[k] = prepareFormattedValue(value, types[Number(typeIndex)]);
                    return acc;
                },
                {} as Record<string, {$type: string; $value: unknown}>,
            );
        });

        dispatch({
            type: 'set-query-result',
            data: {
                queryResult,
            },
        });
    };
}
