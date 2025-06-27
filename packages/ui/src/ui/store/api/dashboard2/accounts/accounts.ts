import {ProgressTheme} from '@gravity-ui/uikit';

import map_ from 'lodash/map';

import Account from '../../../../pages/accounts/selector';

import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {parseAccountData} from '../../../../utils/accounts/accounts-selector';

type AccountsWidgetArgs = {
    id: string;
    accountsList: string[];
    medium?: string[] | string;
};

const attributesToLoad = [
    'diskSpaceLimit',
    'responsibles',
    'totalDiskSpace',
    'resource_limits',
    'resource_usage',
    'committed_resource_usage',
    'recursive_resource_usage',
    'recursive_committed_resource_usage',
    'recursive_violated_resource_limits',
    'allow_children_limit_overcommit',
    'total_children_resource_limits',
    'name',
];

export type Resource = Partial<{
    committed: number;
    uncommitted: number;
    total: number;
    limit: number;
    theme: ProgressTheme;
    progress: number;
    progressText: string;
}>;

export type AccountInfo = {
    name: string;
    [key: string]: Resource | string;
};

export async function fetchAccounts(args: AccountsWidgetArgs) {
    try {
        const {accountsList, medium} = args;
        const response = await ytApiV3.executeBatch({
            parameters: {
                requests: map_(accountsList, (account) => ({
                    command: 'get' as const,
                    parameters: {path: `//sys/accounts/${account}`, attributes: attributesToLoad},
                })),
            },
        });

        if (!response.length) return {data: []};

        const accounts: AccountInfo[] = map_(response, (item, idx) => {
            const {output} = item;
            if (!output) {
                return {
                    name: accountsList?.[idx] || 'noname',
                };
            }
            const account = new Account(parseAccountData(output));

            const res: AccountInfo = {
                name: output?.$attributes?.name || accountsList?.[idx] || 'noname',
                chunkCount: account.getChunkCountProgressInfo(),
                nodeCount: account.getNodeCountProgressInfo(),
            };

            if (Array.isArray(medium)) {
                medium.forEach((item) => {
                    res[item] = account.getDiskSpaceProgressInfo(item, true);
                });
            }

            return res;
        });
        return {data: accounts};
    } catch (error) {
        return {error};
    }
}
