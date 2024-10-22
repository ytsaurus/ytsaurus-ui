import type {QueryResult} from '../preparers/types';
import type {Placeholder} from '../types';
import {placeholdersToMap} from '../helpers/placeholdersToMap';

export const lineAndBarValidation = (queryResult: QueryResult, placeholders: Placeholder[]) => {
    const fields = placeholdersToMap(placeholders);

    const xFieldName = fields.get('x');
    const yFieldName = fields.get('y');
    const notAllFieldsSelected = !xFieldName || !yFieldName;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
        };
    }

    const xCoords: Record<string, boolean> = {};

    const isXCoordsDuplicated = queryResult.some((item) => {
        const xValue = item[xFieldName].$rawValue;

        const isXValueDuplicated = xCoords[xValue];

        xCoords[xValue] = true;

        return isXValueDuplicated;
    });

    return {
        x: {invalid: isXCoordsDuplicated},
    } as unknown as Record<string, {invalid: boolean}>;
};
