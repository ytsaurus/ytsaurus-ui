import {QueryResult} from './types';
import {ChartType} from '../constants';
import {getPointValue} from './getPointData';
import {WaterfallSeries} from '@gravity-ui/chartkit';

export const prepareWaterfall = (
    rows: QueryResult,
    xKey: string,
    yKey: string,
    categoryMode?: boolean,
): WaterfallSeries => {
    return {
        name: yKey,
        type: ChartType.Waterfall,
        data: rows.map((row) => {
            const x = categoryMode ? getPointValue(row[xKey]).toString() : getPointValue(row[xKey]);
            const y = Number(getPointValue(row[yKey]));

            return {x, y};
        }),
    };
};
