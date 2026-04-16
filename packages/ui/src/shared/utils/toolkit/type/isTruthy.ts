import {Falsy} from 'utility-types';

export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => {
    return Boolean(value);
};
