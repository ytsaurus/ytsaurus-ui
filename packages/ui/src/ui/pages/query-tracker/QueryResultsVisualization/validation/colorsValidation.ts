import type {QueryResult} from '../preparers/types';
import type {Placeholder} from '../types';
import objectHash from 'object-hash';

export const colorsValidation = (queryResult: QueryResult, placeholders: Placeholder[]) => {
    const fields = placeholders.reduce((acc: string[], {field}) => {
        if (field) {
            acc.push(field);
        }

        return acc;
    }, []);

    const notAllFieldsSelected = fields.length < placeholders.length;

    if (notAllFieldsSelected) {
        return {
            x: {invalid: false},
        };
    }

    const hashes: Record<string, boolean> = {};

    const isDataDuplicated = queryResult.some((item) => {
        const newObject = fields.reduce((acc: Record<string, string>, field: string) => {
            acc[field] = item[field].$rawValue;
            return acc;
        }, {});

        // eslint-disable-next-line new-cap
        const lineHash = objectHash.MD5(newObject);

        const isLineDuplicated = hashes[lineHash];

        hashes[lineHash] = true;

        return isLineDuplicated;
    });

    return {
        x: {invalid: isDataDuplicated},
    };
};
