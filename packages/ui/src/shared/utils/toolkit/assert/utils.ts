import {AssertionError} from './AssertionError';

export const throwError = (error: Error | string): never => {
    throw typeof error === 'string' ? new AssertionError(error) : error;
};
