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

function collectErrorCodes(error: YTError, dst = new Set<number>()) {
    const saveErrorCode = (v?: number) => {
        if (v !== undefined && !isNaN(v)) {
            dst.add(v);
        }
    };

    saveErrorCode(getYtErrorCode(error));

    if (!error?.inner_errors) {
        return dst;
    }

    const errors = error.inner_errors;

    for (const inner_error of errors) {
        collectErrorCodes(inner_error, dst);
    }

    return dst;
}

export function checkErrorForPrettyCodes(error: YTError) {
    const codes = collectErrorCodes(error);
    return {
        has500: codes.has(500),
        has901: codes.has(901),
    };
}
