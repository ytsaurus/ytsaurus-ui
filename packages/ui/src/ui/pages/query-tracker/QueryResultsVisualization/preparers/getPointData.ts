import {Result} from '../../module/query_result/types';

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

export const getPointValue = (value: Result) => {
    if (NumberTypes.includes(value.$type)) return Number(value.$value);

    return value.$rawValue;
};
