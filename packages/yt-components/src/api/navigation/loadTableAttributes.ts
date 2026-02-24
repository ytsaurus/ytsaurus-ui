import {getBatchError} from '../../utils/error';
import {YTApiSetup, ytApiV3} from '../rum-wrap-api';
import {BatchSubRequest} from '../../types/yt-types';

export const loadTableAttributes = async (path: string, setup: YTApiSetup) => {
    const requests: BatchSubRequest[] = [
        {
            command: 'get' as const,
            parameters: {
                path: `${path}/@`,
            },
        },
        {
            command: 'get' as const,
            parameters: {
                path: `${path}/@schema`,
            },
        },
    ];

    const results = await ytApiV3.executeBatch({
        parameters: {requests},
        setup,
    });

    const error = getBatchError(results, 'Failed to get navigation attributes');
    if (error) throw error;

    return {
        ...results[0].output,
        schema: {
            ...results[1].output,
        },
    };
};
