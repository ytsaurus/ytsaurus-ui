import {Result} from '../../module/query_result/types';
import {DateTime64Types, NumberTypes} from '../../module/queryChart/constants/yqlTypes';
// @ts-ignore
import {timestamp} from '@gravity-ui/unipika/lib/plugins/yql-timestamp';

export const getPointValue = (value: Result) => {
    if (NumberTypes.includes(value.$type)) return Number(value.$value);

    if (value.$type === 'yql.date') {
        const millisecondsInDay = 24 * 60 * 60 * 1000;
        return Number(value.$value) * millisecondsInDay;
    }

    if (value.$type === 'yql.datetime' || value.$type === 'yql.timestamp') {
        return Number(value.$value) * 1000;
    }

    if (DateTime64Types.includes(value.$type)) {
        return timestamp(value);
    }

    return value.$rawValue;
};
