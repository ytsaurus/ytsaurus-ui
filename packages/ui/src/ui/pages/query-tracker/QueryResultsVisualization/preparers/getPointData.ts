import {Result} from '../../module/query_result/types';
// @ts-ignore
import {timestamp} from '@gravity-ui/unipika/lib/plugins/yql-timestamp';

export const NumberTypes = [
    'yql.interval',
    'yql.int32',
    'yql.int64',
    'yql.uint8',
    'yql.uint32',
    'yql.uint64',
    'yql.float',
    'yql.double',
    'yql.decimal',
];

export const DateTimeTypes = ['yql.datetime', 'yql.date', 'yql.timestamp'];
export const DateTime64Types = ['yql.datetime64', 'yql.date64', 'yql.timestamp64'];

export const getPointValue = (value: Result) => {
    if (NumberTypes.includes(value.$type)) return Number(value.$value);
    if (DateTimeTypes.includes(value.$type)) return Number(value.$value) * 1000;

    if (DateTime64Types.includes(value.$type)) {
        return timestamp(value);
    }

    return value.$rawValue;
};
