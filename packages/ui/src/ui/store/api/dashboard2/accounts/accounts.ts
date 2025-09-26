import {ProgressTheme} from '@gravity-ui/uikit';

import map_ from 'lodash/map';

import Account from '../../../../pages/accounts/selector';

import {ytApiV3} from '../../../../rum/rum-wrap-api';
import {parseAccountData} from '../../../../utils/accounts/accounts-selector';
import {UNKNOWN_ITEM_NAME} from '../../../../constants/dashboard2';

import {YTError} from '../../../../types';

type AccountsWidgetArgs = {
    id: string;
    accountsList: string[];
    cluster: string;
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
    general: {
        name: string;
        error?: YTError;
    };
    [key: string]: Resource | Record<string, string | YTError | undefined>;
};

type MasterMemory = Partial<{
    total: number;
    chunk_host: number;
    per_cell: Record<string, number>;
    [key: string]: any;
}>;

type DetailedMasterMemory = Partial<{
    nodes: number;
    chunks: number;
    attributes: number;
    tablets: number;
    schemas: number;
    [key: string]: any;
}>;

type AccountsResponseResource = Partial<{
    node_count: number;
    chunk_count: number;
    tablet_count: number;
    tablet_static_memory: number;
    disk_space_per_medium: Record<string, number>;
    chunk_host_cell_master_memory: number;
    master_memory: MasterMemory;
    detailed_master_memory: DetailedMasterMemory;
    [key: string]: any;
}>;

export type DashboardAccountsResponse = {
    $attributes: Partial<{
        name: string;
        committed_resource_usage: AccountsResponseResource;
        resource_limits: AccountsResponseResource;
        allow_children_limit_overcommit: boolean;
        resource_usage: AccountsResponseResource;
        total_children_resource_limts: AccountsResponseResource;
        recursive_resource_usage: AccountsResponseResource;
        recursive_commited_resource_usage: AccountsResponseResource;
        recursive_violated_resource_limits: AccountsResponseResource;
        total_children_resource_limits: AccountsResponseResource;
        recursive_committed_resource_usage: AccountsResponseResource;
        responsibles: any;
    }>;
    $value: any;
};

export async function fetchAccounts(args: AccountsWidgetArgs) {
    try {
        const {accountsList, medium} = args;
        const response = await ytApiV3.executeBatch<DashboardAccountsResponse>({
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
                    general: {
                        name: accountsList?.[idx] || UNKNOWN_ITEM_NAME,
                        error: item.error,
                    },
                };
            }
            const account = new Account(parseAccountData(output));

            const res: AccountInfo = {
                general: {
                    name: output?.$attributes?.name || accountsList?.[idx] || UNKNOWN_ITEM_NAME,
                },
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
