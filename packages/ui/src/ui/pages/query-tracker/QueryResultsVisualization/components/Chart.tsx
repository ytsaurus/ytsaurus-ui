import React, {useMemo} from 'react';
import ChartKit from '../../../../components/YagrChartKit/YagrChartKit';
import {settings} from '@gravity-ui/chartkit';
import type {ChartKitRef} from '@gravity-ui/chartkit';
import {prepareWidgetData} from '../preparers/prepareWidgetData';
import {useSelector} from 'react-redux';
import {
    selectIsPlaceholdersFieldsFilled,
    selectQueryResultVisualization,
} from '../../module/queryChart/selectors';
import type {QueryResult} from '../preparers/types';
import {EmptyPlaceholdersMessage} from './EmptyPlaceholdersMessage';
import {D3Plugin} from '@gravity-ui/chartkit/d3';

settings.set({plugins: [...settings.get('plugins'), D3Plugin]});

type LineBasicProps = {
    result: QueryResult;
};

export const BaseChart = React.forwardRef<ChartKitRef | undefined, LineBasicProps>(
    function BaseChartComponent({result}, ref) {
        const visualization = useSelector(selectQueryResultVisualization);
        const fieldsIsFilled = useSelector(selectIsPlaceholdersFieldsFilled);

        const widgetData = useMemo(() => {
            return prepareWidgetData({result, visualization});
        }, [result, visualization]);

        if (!fieldsIsFilled) {
            return <EmptyPlaceholdersMessage />;
        }

        return <ChartKit type="d3" data={widgetData} ref={ref} />;
    },
);

export const Chart = React.memo(BaseChart);
