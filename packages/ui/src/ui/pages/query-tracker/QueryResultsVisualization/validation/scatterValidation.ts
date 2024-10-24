import type {QueryResult} from '../preparers/types';
import type {Placeholder} from '../types';
import objectHash from 'object-hash';
import {placeholdersToMap} from '../helpers/placeholdersToMap';

export const scatterValidation = (queryResult: QueryResult, placeholders: Placeholder[]) => {
    const fields = placeholdersToMap(placeholders);

    const xFieldName = fields.get('x');
    const yFieldName = fields.get('y');
    const notAllFieldsSelected = !xFieldName || !yFieldName;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
            y: {invalid: false},
        };
    }

    const hashes: Record<string, boolean> = {};

    const isPointsDuplicated = queryResult.some((item) => {
        const xValue = item[xFieldName].$rawValue;
        const yValue = item[yFieldName].$rawValue;
        // eslint-disable-next-line new-cap
        const hash = objectHash.MD5({
            xValue,
            yValue,
        });

        const isPointDuplicated = hashes[hash];

        hashes[hash] = true;

        return isPointDuplicated;
    });

    return {
        x: {invalid: isPointsDuplicated},
        y: {invalid: isPointsDuplicated},
    };
};
