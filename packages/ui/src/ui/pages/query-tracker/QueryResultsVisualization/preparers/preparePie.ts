import {QueryResult} from './types';
import {getPointValue} from './getPointData';
import type {PieSeries} from '@gravity-ui/chartkit/build/types/widget-data/pie';

export const preparePie = (rows: QueryResult, xKey: string, yKey: string): PieSeries[] => {
    return [
        {
            type: 'pie',
            data: rows.map((row) => ({
                name: getPointValue(row[xKey]).toString(),
                value: Number(getPointValue(row[yKey])),
            })),
        },
    ];
};
