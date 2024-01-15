import {USE_CACHE, USE_MAX_SIZE} from '../../shared/constants/yt-api';
import {BatchSubRequest} from '../../shared/yt-types';

export function makeGet(
    path: string,
    parameters?: Omit<(BatchSubRequest & {command: 'get'})['parameters'], 'path'>,
) {
    return {
        command: 'get' as const,
        parameters: {
            path,
            ...parameters,
            ...USE_CACHE,
        },
    };
}

export function makeList(
    path: string,
    parameters?: Omit<(BatchSubRequest & {command: 'list'})['parameters'], 'path'>,
) {
    return {
        command: 'list' as const,
        parameters: {
            path,
            ...parameters,
            ...USE_CACHE,
            ...USE_MAX_SIZE,
        },
    };
}
