import {YTError} from '../../@types/types';

export function getYtPageIdParts(url: string): PageId {
    try {
        const {pathname} = new URL(url);
        const arr = pathname.split('/').slice(1); // cut off first slash;

        const section = arr[1];

        if (section === 'operations' || section === 'tablet') {
            arr.splice(2, 1);
        } else if (section === 'job') {
            arr.splice(2, 2);
        }

        const cluster = arr[0]; // cluster | odin | resource-planner

        return {
            parts: arr,
            toString() {
                return arr.join('_');
            },
            getPage() {
                return section || cluster;
            },
        };
    } catch {
        return {
            parts: [],
            toString: () => '',
            getPage: () => '',
        };
    }
}

interface PageId {
    parts: Array<string>;
    toString(): string;
    getPage(): string;
}

export function isYTError(error: unknown): error is YTError {
    const {yt_javascript_wrapper, inner_errors} = (error as YTError) ?? {};
    return (
        Array.isArray(inner_errors) ||
        Boolean(yt_javascript_wrapper?.xYTTraceId && yt_javascript_wrapper?.xYTRequestId)
    );
}

export function makeRegexpFromSettings(value?: string) {
    if (!value) {
        return undefined;
    }

    try {
        return new RegExp(value!);
    } catch {
        return undefined;
    }
}
