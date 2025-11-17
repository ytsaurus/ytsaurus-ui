import forEach_ from 'lodash/forEach';

import {YTError} from '../../@types/types';
import {BatchResultsItem} from '../yt-types';

export class UIBatchError implements YTError {
    message = '';

    code?: number;
    attributes?: any;
    inner_errors?: YTError[];

    constructor(error: string | YTError<{attributes?: object}>) {
        delete this.code;
        delete this.attributes;
        delete this.inner_errors;

        if (typeof error === 'string') {
            this.message = error;
        } else {
            Object.assign(this, error);
        }
    }
}

export function getBatchError<T = unknown>(
    batchResults: Array<BatchResultsItem<T>>,
    message: string,
): YTError | undefined {
    return splitBatchResults(batchResults, new UIBatchError(message)).error;
}

export function splitBatchResults<T = unknown>(
    batchResults: Array<BatchResultsItem<T>>,
    inputError: string | UIBatchError,
    {ignoreErrorCodes}: {ignoreErrorCodes?: Array<number>} = {},
): SplitedBatchResults<T> {
    const dstError: UIBatchError =
        typeof inputError === 'string' ? new UIBatchError(inputError) : inputError;

    const ignoreCodes = new Set<number | undefined>(ignoreErrorCodes);
    const errorIgnoredIndices: Array<number> = [];

    const innerErrors: Array<YTError> = [];
    const results: Array<T> = [];
    const outputs: Array<T | undefined> = [];
    const errorIndices: Array<number> = [];
    const resultIndices: Array<number> = [];
    forEach_(batchResults, (res, index) => {
        const {error, output} = res;
        outputs.push(output);
        if (error) {
            if (ignoreCodes.has(error.code)) {
                errorIgnoredIndices.push(index);
            } else {
                innerErrors.push(error);
                errorIndices.push(index);
            }
        } else {
            results.push(output!);
            resultIndices.push(index);
        }
    });

    if (innerErrors.length) {
        dstError.inner_errors = dstError.inner_errors ?? [];
        dstError.inner_errors.push(...innerErrors);
    }

    const error = !innerErrors.length ? undefined : dstError;
    return {
        error: error as UIBatchError,
        results,
        outputs,
        errorIndices,
        resultIndices,
        errorIgnoredIndices,
    };
}

export interface SplitedBatchResults<T> {
    error: YTError | undefined;
    results: Array<T>;
    outputs: Array<T | undefined>;
    errorIndices: Array<number>;
    resultIndices: Array<number>;
    errorIgnoredIndices: Array<number>;
}
