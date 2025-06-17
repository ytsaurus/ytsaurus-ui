import {getYtErrorCode} from '../../../../../utils/errors';
import {YTError} from '../../../../../../@types/types';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import ypath from '../../../../../common/thor/ypath';

export type ErrorCode = 500 | 901;

type NoAccessTitlePayload = {
    username?: string;
    permissions?: Array<UnipikaValue>;
    path?: string;
};

type NoPathTitlePayload = {
    path: string;
};

type TitlePayload = NoAccessTitlePayload & NoPathTitlePayload;

type ErrorInfo = {
    [key in ErrorCode]:
        | {
              getTitle: (payload: TitlePayload) => string;
          }
        | undefined;
};

export const ErrorsInfo: ErrorInfo = {
    901: {
        getTitle: (payload: NoAccessTitlePayload) => {
            const {username, permissions, path} = payload;
            const permission = permissions
                ?.map((perm: UnipikaValue) => ypath.getValue(perm))
                .join(' | ');
            const permissionsStr = permission ? `"${permission}"` : '';
            return `User ${username} does not have ${permissionsStr} access to node "${path}"`;
        },
    },
    500: {
        getTitle: (payload: NoPathTitlePayload) => {
            const {path} = payload;
            return `Path "${path}" does not exist`;
        },
    },
};

export function getErrorTitle(
    {attributes, code}: {code: ErrorCode} & Pick<YTError, 'attributes'>,
    path?: string,
): string {
    const title = ErrorsInfo[code!]?.getTitle({
        path: path || '',
        username: ypath.getValue(attributes, '/user') || '',
        permissions: ypath.getValue(attributes, '/permission') || [],
    });

    return title ?? 'An unexpected error occurred';
}

/**
 * returns first non-undefined error code,
 * from root error to inner errors
 */
export function getLeadingErrorCode(error: YTError): number | undefined {
    const errorCode = getYtErrorCode(error);
    if (!isNaN(errorCode)) {
        return errorCode;
    }

    if (!error?.inner_errors) return;

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
