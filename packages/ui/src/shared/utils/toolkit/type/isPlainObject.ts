import isPlainObject_ from 'lodash/isPlainObject';

export const isPlainObject = (value: unknown): value is Record<PropertyKey, unknown> => {
    return isPlainObject_(value);
};
