import {getYtErrorCode} from '../../../../../utils/errors';
import {YTError} from '../../../../../../@types/types';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';

/**
 * should be: (typeof YTErrors)[keyof typeof YTErrors]
 * after migrating javascript-wrapper on TS
 */
export type ErrorCode = 500 | 901;

type NoAccessTitlePayload = {
    username: string;
    permissions: Array<UnipikaValue>;
    path: string;
};

type NoPathTitlePayload = {
    path: string;
};

type TitlePayload = NoAccessTitlePayload & NoPathTitlePayload;

type ErrorInfo = {
    [key in ErrorCode]: {
        getTitle: (payload: TitlePayload) => string;
    };
};

export const ErrorsInfo: ErrorInfo = {
    901: {
        getTitle: (payload: NoAccessTitlePayload) => {
            const {username, permissions, path} = payload;
            const permission = permissions.map((perm: UnipikaValue) => perm.$value).join(' | ');
            return `User ${username} does not have "${permission}" access to node "${path}"`;
        },
    },
    500: {
        getTitle: (payload: NoPathTitlePayload) => {
            const {path} = payload;
            return `Path "${path}" does not exist`;
        },
    },
};

export function getErrorTitle(error: YTError, path?: string): string {
    const {attributes} = error;

    const code = getLeadingErrorCode(error);

    if (!code) return 'An unexpected error occurred';

    const title = ErrorsInfo[code].getTitle({
        path: path || '',
        username: attributes?.user.$value || '',
        permissions: attributes?.permission || '',
    });

    return title;
}

/**
 * returns first non-undefined error code,
 * from root error to inner errors
 */
export function getLeadingErrorCode(error: YTError): ErrorCode | undefined {
    const errorCode = getYtErrorCode(error);
    if (!isNaN(errorCode)) {
        return errorCode;
    }

    if (!error.inner_errors) return;

    const errors = error.inner_errors;

    for (const inner_error of errors) {
        const innerErrorCode = getYtErrorCode(inner_error);
        if (!isNaN(innerErrorCode)) {
            return innerErrorCode;
        }

        if (inner_error.inner_errors) {
            errors.concat(inner_error.inner_errors);
        }
    }

    return;
}
