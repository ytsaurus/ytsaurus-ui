import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import throttle_ from 'lodash/throttle';
import block from 'bem-cn-lite';
import {type ChartKitRef} from '@gravity-ui/chartkit';
import {Chart} from './Chart';
import {QueryItem} from '../../module/api';
import useResizeObserver from '../../../../hooks/useResizeObserver';
import {ChartFields} from './ChartFields';
import './QueryResultsVisualization.scss';
import {saveQueryChartConfig} from '../../module/queryChart/actions';
import {
    selectAvailableFields,
    selectQueryResult,
    selectQueryResultVisualization,
} from '../../module/queryChart/selectors';
import {ChartSettingsComponent} from './ChartSettings';
import {VisualizationSelector} from './VisualizationSelector';
import {SavingIndicator} from './SavingIndicator';
import {ChartValidation} from './ChartValidation';

import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';

const b = block('query-result-visualization');

type QueryResultsVisualizationProps = {
    query: QueryItem;
};

export function QueryResultsVisualization({query}: QueryResultsVisualizationProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartKitRef = React.useRef<ChartKitRef>();
    const visualization = useSelector(selectQueryResultVisualization);
    const queryResult = useSelector(selectQueryResult);
    const availableFields = useSelector(selectAvailableFields);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            saveQueryChartConfig({
                queryId: query.id,
                visualization,
            }),
        );
    }, [query.id, visualization, dispatch]);

    const debouncedChartResize = React.useMemo(() => {
        return throttle_(() => {
            chartKitRef.current?.reflow();
        }, 300);
    }, []);

    useResizeObserver({
        element: containerRef.current ?? undefined,
        onResize: debouncedChartResize,
    });

    return (
        <div className={b()} ref={containerRef}>
            <div className={b('controls-wrapper')}>
                <div className={b('group-wrapper')}>
                    <VisualizationSelector />
                    <ChartSettingsComponent />
                    <SavingIndicator />
                </div>
                <ChartFields availableFields={availableFields} />
            </div>
            <div className={b('chartkit-wrapper')}>
                <ErrorBoundary>
                    <ChartValidation>
                        <Chart result={queryResult} ref={chartKitRef} />
                    </ChartValidation>
                </ErrorBoundary>
            </div>
        </div>
    );
}
