import {YTError} from '../../types/error';

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
