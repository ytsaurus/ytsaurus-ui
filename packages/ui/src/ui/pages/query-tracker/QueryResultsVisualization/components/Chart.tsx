import React, {forwardRef, useMemo} from 'react';
import ChartKit from '../../../../components/YagrChartKit/YagrChartKit';
import {settings} from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {prepareWidgetData} from '../preparers/prepareWidgetData';
import {useSelector} from 'react-redux';
import {selectChartVisualization, selectQueryResult} from '../../module/queryChart/selectors';
import {EmptyPlaceholdersMessage} from './EmptyPlaceholdersMessage';
import {D3Plugin} from '@gravity-ui/chartkit/d3';

settings.set({plugins: [...settings.get('plugins'), D3Plugin]});

export const BaseChart = forwardRef<ChartKitRef | undefined>(function BaseChartComponent(_, ref) {
    const result = useSelector(selectQueryResult);
    const visualization = useSelector(selectChartVisualization);

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

    return <ChartKit type="d3" data={widgetData} ref={ref} key={axisKey} />;
});

export const Chart = React.memo(BaseChart);
