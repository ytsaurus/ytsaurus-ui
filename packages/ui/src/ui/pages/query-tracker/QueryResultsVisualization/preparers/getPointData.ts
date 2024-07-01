import {FieldObject} from './types';

export const getPointValue = (value: FieldObject) => {
    switch (value.$type) {
        case 'yql.interval': {
            return Number(value.$value);
        }

        case 'yql.int32':
        case 'yql.int64':
        case 'yql.uint8':
        case 'yql.uint32':
        case 'yql.uint64':
        case 'yql.float':
        case 'yql.double':
        case 'yql.decimal':
            return Number(value.$value);
        default:
            return value.$rawValue;
    }
};
