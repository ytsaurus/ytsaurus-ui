import isEqual_ from 'lodash/isEqual';

import {EMPTY_ARRAY, EMPTY_MAP, EMPTY_OBJECT, EMPTY_SET} from '../constants/empty';

export function replaceEmpty<T extends {}>(data: T): T {
    return Object.keys(data).reduce(
        (acc, k) => {
            const key = k as keyof typeof data;
            const d = data[key];
            if (d !== EMPTY_OBJECT && isEqual_(d, EMPTY_OBJECT)) {
                acc[key] = EMPTY_OBJECT as any;
            } else if (d !== EMPTY_ARRAY && isEqual_(d, EMPTY_ARRAY)) {
                acc[key] = EMPTY_ARRAY as any;
            } else if (d !== EMPTY_SET && isEqual_(d, EMPTY_SET)) {
                acc[key] = EMPTY_SET as any;
            } else if (d !== EMPTY_MAP && isEqual_(d, EMPTY_MAP)) {
                acc[key] = EMPTY_MAP as any;
            }
            return acc;
        },
        {...data},
    );
}
