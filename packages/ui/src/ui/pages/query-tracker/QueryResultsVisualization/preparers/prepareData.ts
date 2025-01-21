import {QueryResult} from './types';
import {ChartType} from '../constants';
import {getPointValue} from './getPointData';
import {AreaSeries, BarXSeries, BarYSeries, LineSeries, ScatterSeries} from '@gravity-ui/chartkit';

export const prepareData = (
    rows: QueryResult,
    xKey: string,
    yKey: string,
    type: ChartType.BarX | ChartType.BarY | ChartType.Area | ChartType.Line | ChartType.Scatter,
    categoryMode?: boolean,
): BarXSeries | BarYSeries | AreaSeries | LineSeries | ScatterSeries => {
    const invertAxis = type === ChartType.BarY;
    return {
        name: yKey,
        type,
        data: rows.map((row) => {
            const x = categoryMode ? getPointValue(row[xKey]).toString() : getPointValue(row[xKey]);
            const y = getPointValue(row[yKey]);

            return invertAxis ? {x: y, y: x} : {x, y};
        }),
    };
};
