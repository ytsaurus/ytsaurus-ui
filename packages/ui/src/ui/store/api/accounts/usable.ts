import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {RootState} from '../../../store/reducers';
import {getCurrentUserName} from '../../../store/selectors/global';

import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getBatchError} from '../../../utils/utils';

export async function usable(_args: void, api: BaseQueryApi) {
    try {
        const state = api.getState() as RootState;
        const username = getCurrentUserName(state);
        const response = await ytApiV3Id.executeBatch<string[]>(YTApiId.usableAccounts, {
            parameters: {
                requests: [
                    {
                        command: 'get' as const,
                        parameters: {path: `//sys/users/${username}/@usable_accounts`},
                    },
                ],
            },
        });

        const error = getBatchError(response, 'Failed to get usable accounts');

        if (error) {
            throw error;
        }

        const data = response?.[0]?.output;

        return {data};
    } catch (error) {
        return {error};
    }
}
