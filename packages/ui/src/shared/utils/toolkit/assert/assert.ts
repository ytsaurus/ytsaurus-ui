import {throwError} from './utils';

export function assert(value: unknown, error?: Error | string): asserts value {
    if (value) {
        return;
    }

    throwError(error ?? 'Value must be truthy.');
}
