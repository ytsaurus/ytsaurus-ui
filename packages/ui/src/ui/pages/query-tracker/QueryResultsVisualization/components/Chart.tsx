import React, {forwardRef, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {ChartKitRef, YTChartKitLazy} from '../../../../components/YTChartKit';

import {prepareWidgetData} from '../preparers/prepareWidgetData';
import {
    selectCurrentChartVisualization,
    selectQueryResult,
} from '../../../../store/selectors/query-tracker/queryChart';
import {EmptyPlaceholdersMessage} from './EmptyPlaceholdersMessage';

export const BaseChart = forwardRef<ChartKitRef | null>(function BaseChartComponent(_, ref) {
    const result = useSelector(selectQueryResult);
    const visualization = useSelector(selectCurrentChartVisualization);

    const widgetData = useMemo(() => {
        return prepareWidgetData(result, visualization);
    }, [result, visualization]);

    const axisKey = useMemo(() => {
        return (
            visualization.xField + visualization.config.xAxis.type + visualization.yField.join('')
        );
    }, [visualization]);

    if (!visualization.xField || !visualization.yField || !widgetData) {
        return <EmptyPlaceholdersMessage />;
    }

    return <YTChartKitLazy type="d3" data={widgetData} chartRef={ref} key={axisKey} />;
});

export const Chart = React.memo(BaseChart);
