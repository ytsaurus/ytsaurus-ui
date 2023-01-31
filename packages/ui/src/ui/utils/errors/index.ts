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
