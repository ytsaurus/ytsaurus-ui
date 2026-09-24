import {type YTError} from '../../../../@types/types';
import {USE_CACHE, USE_MAX_SIZE} from '../../../../shared/constants/yt-api';
import {YTApiId, type YTApiSetup, ytApiV3Id} from '../../../rum/rum-wrap-api';

export interface AccountNamesArgs {
    cluster: string;
    setup?: YTApiSetup;
}

export async function fetchAccountNames({setup}: AccountNamesArgs) {
    try {
        const data = await ytApiV3Id.list<string[]>(YTApiId.listAccounts, {
            setup,
            parameters: {
                path: '//sys/accounts',
                ...USE_MAX_SIZE,
                ...USE_CACHE,
            },
        });

        return {data};
    } catch (error) {
        return {error: error as YTError};
    }
}
