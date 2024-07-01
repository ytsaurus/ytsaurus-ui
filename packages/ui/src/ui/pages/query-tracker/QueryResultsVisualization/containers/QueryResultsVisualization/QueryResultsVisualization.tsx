import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import throttle from 'lodash/throttle';
import block from 'bem-cn-lite';
import {type ChartKitRef} from '@gravity-ui/chartkit';
import {Chart} from '../Chart/Chart';
import {QueryItem} from '../../../module/api';
import useResizeObserver from '../../../../../hooks/useResizeObserver';
import {Loader} from '@gravity-ui/uikit';
import {PlaceholdersContainer} from '../PlaceholdersContainer/PlaceholdersContainer';
import './QueryResultsVisualization.scss';
import {newbiusLoadQueryResults, saveQueryChartConfig} from '../../store/actions';
import {
    selectAvailableFields,
    selectQueryId,
    selectQueryResult,
    selectQueryResultAllVisualizations,
    selectQueryResultIndex,
} from '../../store/selectors';
import {QueryResultSelect} from '../VisualizationSelect/VisualizationSelect';
import {ChartSettingsComponent} from '../ChartSettings/ChartSettings';
import {VisualizationSelector} from '../VisualizationSelector/VisualizationSelector';
import {SavingIndicator} from '../SavingIndicator/SavingIndicator';
import {ChartErrorBoundary} from '../../components/ChartErrorBoundary/ChartErrorBoundary';
import {ChartValidation} from '../ChartValidation/ChartValidation';

const b = block('query-result-visualization');

type QueryResultsVisualizationProps = {
    query: QueryItem;
    index: number;
};

export function QueryResultsVisualization({query}: QueryResultsVisualizationProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartKitRef = React.useRef<ChartKitRef>();
    const allVisualizations = useSelector(selectQueryResultAllVisualizations);
    const resultIndex = useSelector(selectQueryResultIndex);
    const queryResult = useSelector(selectQueryResult);
    const queryId = useSelector(selectQueryId);
    const availableFields = useSelector(selectAvailableFields);

    const dispatch = useDispatch();

    useEffect(() => {
        const weRecievedNewQuery = query.id !== queryId;

        if (weRecievedNewQuery) {
            dispatch({
                type: 'set-query',
                data: {
                    query,
                },
            });
        }
    }, [query.id, queryId]);

    useEffect(() => {
        dispatch(
            newbiusLoadQueryResults({
                queryId: query.id,
                resultIndex,
            }),
        );
    }, [query.id, resultIndex, dispatch]);

    useEffect(() => {
        dispatch(
            saveQueryChartConfig({
                queryId: query.id,
                visualizations: allVisualizations,
            }),
        );
    }, [query.id, allVisualizations]);

    const debouncedChartResize = React.useMemo(() => {
        return throttle(() => {
            chartKitRef.current?.reflow();
        }, 300);
    }, [chartKitRef.current]);

    useResizeObserver({
        element: containerRef.current ?? undefined,
        onResize: debouncedChartResize,
    });

    if (!queryResult) {
        return (
            <div className={b('loader-wrapper')}>
                <Loader className={b('loader')} />
            </div>
        );
    }

    return (
        <div className={b()} ref={containerRef}>
            <div className={b('controls-wrapper')}>
                <div className={b('group-wrapper')}>
                    <QueryResultSelect resultCount={query.result_count} />
                </div>
                <div className={b('group-wrapper')}>
                    <VisualizationSelector />
                    <ChartSettingsComponent />
                    <SavingIndicator />
                </div>
                <PlaceholdersContainer availableFields={availableFields} />
            </div>
            <div className={b('chartkit-wrapper')}>
                <ChartErrorBoundary>
                    <ChartValidation>
                        <Chart result={queryResult} ref={chartKitRef} />
                    </ChartValidation>
                </ChartErrorBoundary>
            </div>
        </div>
    );
}
