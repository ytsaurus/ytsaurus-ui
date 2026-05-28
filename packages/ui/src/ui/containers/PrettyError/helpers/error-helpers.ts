import {type YTError} from '../../../../@types/types';
import {getYtErrorCode} from '../../../utils/errors';
import ypath from '../../../common/thor/ypath';
import {type UnipikaValue} from '../../../components/Yson/StructuredYson/StructuredYsonTypes';

export type ErrorTitlePayload = {
    username?: string;
    permissions?: Array<UnipikaValue>;
    path?: string;
    [key: string]: any;
};

export type ErrorsInfoMap = Record<
    number,
    {
        getTitle: (payload: ErrorTitlePayload) => string;
    }
>;

export function collectErrorCodes(error: YTError, dst = new Set<number>()): Set<number> {
    const code = getYtErrorCode(error);
    if (code !== undefined && !isNaN(code)) {
        dst.add(code);
    }

    if (error?.inner_errors) {
        for (const inner_error of error.inner_errors) {
            collectErrorCodes(inner_error, dst);
        }
    }

    return dst;
}

export function determineErrorCode(error: YTError, errorsInfo: ErrorsInfoMap): number | undefined {
    const codes = collectErrorCodes(error);
    const availableCodes = Object.keys(errorsInfo).map(Number);
    for (const code of availableCodes) {
        if (codes.has(code)) {
            return code;
        }
    }
    return undefined;
}

export function findErrorByCode(error: YTError, code: number): YTError | undefined {
    const currentCode = getYtErrorCode(error);
    if (currentCode === code) {
        return error;
    }

    if (error?.inner_errors) {
        for (const inner of error.inner_errors) {
            const found = findErrorByCode(inner, code);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

export function getErrorTitle(
    error: YTError,
    code?: number,
    errorsInfo?: ErrorsInfoMap,
    contextPayload?: Partial<ErrorTitlePayload>,
): string | undefined {
    if (!code || !errorsInfo?.[code]?.getTitle) {
        return undefined;
    }

    const getTitle = errorsInfo[code]!.getTitle;

    const targetError = findErrorByCode(error, code) || error;
    const attributes = targetError.attributes;

    return getTitle({
        ...contextPayload,
        username: attributes ? ypath.getValue(attributes, '/user') : '',
        permissions: attributes ? ypath.getValue(attributes, '/permission') : [],
    });
}
