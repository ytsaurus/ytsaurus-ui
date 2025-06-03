// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YTErrorRaw} from '../../../@types/types';

import type {YTError} from '../../types';
import {ypathBase} from '../../common/thor/ypath-base';

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

export function appendInnerErrors(targetErr: any, innerErr: YTError) {
    if (!targetErr) {
        targetErr = new Error('Unexpected behavior: targetErr is undefined.');
    }

    if (!targetErr.inner_errors) {
        targetErr.inner_errors = [innerErr];
        return targetErr;
    }

    if (Array.isArray(targetErr.inner_errors)) {
        targetErr.inner_errors.push(innerErr);
    } else {
        targetErr.inner_errors = [targetErr.inner_errors, innerErr];
    }
    return targetErr;
}

export function getYtErrorCode(error: YTErrorRaw | unknown): number {
    return ypathBase.getNumberBase(error, '/code', NaN);
}
