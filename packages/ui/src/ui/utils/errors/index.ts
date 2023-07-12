// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YTError} from '../../types';

export function getErrorWithCode(errors: YTError[], code: number): YTError | undefined {
    const queue: YTError[] = [...errors];

    let i = 0;
    while (queue[i]) {
        const error = queue[i];
        if (error.code === code) return error;
        if (Array.isArray(error.inner_errors)) queue.push(...error.inner_errors);
        i += 1;
    }

    return undefined;
}

export function getPermissionDeniedError(error: YTError): YTError | undefined {
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
