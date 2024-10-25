import type {
    ChartSettings,
    ExtendedQueryItem,
    Field,
    Visualization,
    VisualizationId,
} from '../types';
import type {ActionD} from '../../../../types';
import type {QueryResult} from '../preparers/types';

export interface QueryResultsVisualizationState {
    saved: boolean;
    query: ExtendedQueryItem | undefined;
    queryResults: Record<number, QueryResult>;
    resultIndex: number;
    visualizations: Visualization[];
}

function getInitialVisualization(): Visualization {
    return {
        id: 'line',
        placeholders: [
            {
                id: 'x',
                fields: [],
            },
            {
                id: 'y',
                fields: [],
            },
            {
                id: 'colors',
                fields: [],
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
}

export const initialState: QueryResultsVisualizationState = {
    saved: true,
    query: undefined,
    queryResults: {},
    resultIndex: 0,
    visualizations: [getInitialVisualization()],
};

export type QueryResultVisualizationAction =
    | ActionD<'set-fields', {placeholderId: string; fields: Field[]}>
    | ActionD<'remove-field', {placeholderId: string; field: Field}>
    | ActionD<'set-chart-settings', ChartSettings>
    | ActionD<'set-visualization', VisualizationId>
    | ActionD<'set-query', {query: ExtendedQueryItem}>
    | ActionD<'set-result-index', number>
    | ActionD<'set-visualization-saved', {saved: boolean}>
    | ActionD<'set-query-result', {queryResult: QueryResult}>;

export function queryResultsVisualization(
    state: QueryResultsVisualizationState = initialState,
    action: QueryResultVisualizationAction,
): QueryResultsVisualizationState {
    switch (action.type) {
        case 'set-visualization-saved': {
            const {saved} = action.data;

            return {
                ...state,
                saved,
            };
        }
        case 'set-query': {
            const {query} = action.data;

            const queryVisualizations = query.annotations?.ui_chart_config || [];

            const visualizations = [];

            for (let i = 0; i < query.result_count; i++) {
                visualizations.push(queryVisualizations[i] || getInitialVisualization());
            }

            return {
                ...state,
                query,
                queryResults: {},
                visualizations,
            };
        }
        case 'set-query-result': {
            const {queryResult} = action.data;

            return {
                ...state,
                queryResults: {
                    ...state.queryResults,
                    [state.resultIndex]: queryResult,
                },
            };
        }
        case 'set-fields': {
            const visualizations = state.visualizations.map((visualization, index) => {
                if (index !== state.resultIndex) {
                    return visualization;
                }

                return {
                    ...visualization,
                    placeholders: visualization.placeholders.map((placeholder) => {
                        if (placeholder.id === action.data.placeholderId) {
                            return {
                                ...placeholder,
                                fields: action.data.fields,
                            };
                        }

                        return placeholder;
                    }),
                };
            });

            return {
                ...state,
                visualizations,
            };
        }
        case 'remove-field': {
            const visualizations = state.visualizations.map((visualization, index) => {
                if (index !== state.resultIndex) {
                    return visualization;
                }

                const placeholders = visualization.placeholders.map((placeholder) => {
                    if (placeholder.id === action.data.placeholderId) {
                        return {
                            ...placeholder,
                            fields: placeholder.fields.filter(
                                (field) => field.name !== action.data.field.name,
                            ),
                        };
                    }

                    return placeholder;
                });

                return {
                    ...visualization,
                    placeholders,
                };
            });

            return {
                ...state,
                visualizations,
            };
        }
        case 'set-chart-settings': {
            const visualizations = state.visualizations.map((visualization, index) => {
                if (index !== state.resultIndex) {
                    return visualization;
                }

                return {
                    ...visualization,
                    chartSettings: action.data,
                };
            });

            return {
                ...state,
                visualizations,
            };
        }
        case 'set-visualization': {
            const visualizations = state.visualizations.map((visualization, index) => {
                if (index !== state.resultIndex) {
                    return visualization;
                }

                return {
                    ...visualization,
                    id: action.data,
                };
            });

            return {
                ...state,
                visualizations,
            };
        }
        case 'set-result-index': {
            return {
                ...state,
                resultIndex: action.data,
            };
        }
        default:
            return state;
    }
}
