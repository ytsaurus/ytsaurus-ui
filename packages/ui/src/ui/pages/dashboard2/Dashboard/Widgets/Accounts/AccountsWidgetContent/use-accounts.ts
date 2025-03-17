import map_ from 'lodash/map';

import {useFetchBatchQuery} from '../../../../../../store/api/yt';

import {YTApiId} from '../../../../../../rum/rum-wrap-api';
import Account from '../../../../../../pages/accounts/selector';
import {parseAccountData} from '../../../../../../utils/accounts/accounts-selector';

const attributesToLoad = [
    'diskSpaceLimit',
    'parent_name',
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
    'folder_id',
    'name',
];

export function useAccounts(accountsList: string[], medium?: string) {
    const {data, isLoading} = useFetchBatchQuery({
        parameters: {
            requests: map_(accountsList, (account) => ({
                command: 'get' as const,
                parameters: {path: `//sys/accounts/${account}`, attributes: attributesToLoad},
            })),
        },
        id: YTApiId.accountsData,
    });

    const accounts = map_(data, (item) => {
        const {output} = item;

        if (output) {
            const account = new Account(parseAccountData(output));

            return {
                name: output?.$attributes?.name,
                chunkCount: account.getChunkCountProgressInfo(),
                diskSpace: account.getDiskSpaceProgressInfo(medium ?? 'default', true),
                nodeCount: account.getNodeCountProgressInfo(),
            };
        }

        return;
    });

    return {accounts, isLoading};
}
