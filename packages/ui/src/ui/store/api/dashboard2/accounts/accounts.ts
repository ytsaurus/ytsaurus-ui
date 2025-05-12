import map_ from 'lodash/map';

import Account from '../../../../pages/accounts/selector';

import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {parseAccountData} from '../../../../utils/accounts/accounts-selector';

type AccountsWidgetArgs = {
    accountsList: string[];
    medium?: string;
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

export async function accounts(args: AccountsWidgetArgs) {
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

        const accounts = map_(response, (item, idx) => {
            const {output} = item;
            if (!output) {
                return {
                    name: accountsList?.[idx] || 'noname',
                };
            }
            const account = new Account(parseAccountData(output));

            return {
                name: output?.$attributes?.name || accountsList?.[idx] || 'noname',
                chunkCount: account.getChunkCountProgressInfo(),
                diskSpace: account.getDiskSpaceProgressInfo(medium || 'default', true),
                nodeCount: account.getNodeCountProgressInfo(),
            };
        });
        return {data: accounts};
    } catch (error) {
        return {error};
    }
}
