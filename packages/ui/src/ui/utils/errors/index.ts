// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {type YTErrorRaw} from '../../../@types/types';

import {type YTError} from '../../types';
// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';

export function forEachYTError<T extends YTErrorRaw>(
    errors: Array<T>,
    visitor: (error: T) => void,
) {
    const queue: T[] = [...errors];

    let i = 0;
    while (queue[i]) {
        const item = queue[i];
        visitor(item);
        if (Array.isArray(item.inner_errors)) {
            queue.push(...(item.inner_errors as Array<T>));
        }
        ++i;
    }
}

export function getErrorWithCode<T extends YTErrorRaw>(errors: T[], code: number): T | undefined {
    let res: T | undefined;
    forEachYTError(errors, (error) => {
        if (!res && getYtErrorCode(error) === code) {
            res = error;
        }
    });
    return res;
}

export function getPermissionDeniedError<T extends YTErrorRaw>(error: T): T | undefined {
    return getErrorWithCode([error], yt.codes.PERMISSION_DENIED);
}

export function getNotFoundError<T extends YTErrorRaw>(error: T): T | undefined {
    return getErrorWithCode([error], yt.codes.NOT_FOUND);
}

export function appendInnerErrors(targetErr: any, innerErr: YTError) {
    const resolvedError = targetErr || new Error('Unexpected behavior: targetErr is undefined.');

    if (!resolvedError.inner_errors) {
        resolvedError.inner_errors = [innerErr];
        return resolvedError;
    }

    if (Array.isArray(resolvedError.inner_errors)) {
        resolvedError.inner_errors.push(innerErr);
    } else {
        resolvedError.inner_errors = [resolvedError.inner_errors, innerErr];
    }
    return resolvedError;
}

export function getYtErrorCode(error: YTErrorRaw | unknown): number {
    return ypath.getNumberBase(error, '/code', NaN);
}
