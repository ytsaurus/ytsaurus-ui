import {NetworkCode} from '../../../../../constants/navigation/modals/path-editing-popup';

export type ErrorType = {
    attributes: any;
    message: string;
    inner_errors: Error[];
    code: number;
};

export type ErrorName = keyof typeof NetworkCode;

export type ErrorCode = (typeof NetworkCode)[keyof typeof NetworkCode];

type Permission = {$type: string; $value: any};

type NoAccessTitlePayload = {
    username: string;
    permissions: Array<Permission>;
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
            const permission = permissions.map((perm: Permission) => perm.$value).join(' | ');
            return `User ${username} does not have "${permission}" access to node "${path}"`;
        },
    },
    500: {
        getTitle: (payload: NoPathTitlePayload) => {
            const {path} = payload;
            return `Path "${path}" does not exist`;
        },
    },
    0: {
        getTitle: () => {
            return 'Unexpected error 0';
        },
    },
    501: {
        getTitle: () => {
            return 'Unexpected error 501';
        },
    },
    1706: {
        getTitle: () => {
            return 'Unexpected error 1706';
        },
    },
    902: {
        getTitle: () => {
            return 'Unexpected error 902';
        },
    },
};

export function getErrorTitle(type: ErrorName, error: ErrorType, path?: string): string {
    const {attributes} = error;

    const title = ErrorsInfo[NetworkCode[type]].getTitle({
        path: path || '',
        username: attributes?.user.$value || '',
        permissions: attributes?.permission || '',
    });

    return title;
}
