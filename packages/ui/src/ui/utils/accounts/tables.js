import {ACCOUNTS_TABLE_ID} from '../../constants/accounts/accounts';
import _cloneDeep from 'lodash/cloneDeep';
import _forEach from 'lodash/forEach';

export const columnsItems = {
    name: {
        caption: 'Name',
        sort(account) {
            return account.name;
        },
        align: 'left',
    },
    alerts: {
        caption: 'A',
        tooltipProps: {
            content: 'Alerts',
        },
        sort(item) {
            return item.alertsCount;
        },
        align: 'center',
    },
    node_count_default: {
        caption: 'Nodes',
        sort(account) {
            return account.nodeCountProgress;
        },
        align: 'center',
    },
    node_count: {
        group: true,
        items: {
            percentage: {
                sort(account) {
                    return account.nodeCountProgress;
                },
                align: 'center',
            },
            usage: {
                sort(account) {
                    return account.totalNodeCount;
                },
                align: 'right',
            },
            limit: {
                sort(account) {
                    return account.nodeCountLimit;
                },
                align: 'right',
            },
            free: {
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    chunk_count_default: {
        caption: 'Chunks',
        sort(account) {
            return account.chunkCountProgress;
        },
        align: 'center',
    },
    chunk_count: {
        group: true,
        items: {
            percentage: {
                sort(account) {
                    return account.chunkCountProgress;
                },
                align: 'center',
            },
            usage: {
                sort(account) {
                    return account.totalChunkCount;
                },
                align: 'right',
            },
            limit: {
                sort(account) {
                    return account.chunkCountLimit;
                },
                align: 'right',
            },
            free: {
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    tablet_count: {
        group: true,
        items: {
            percentage: {
                sort(account) {
                    return account.tabletCountProgress;
                },
                align: 'center',
            },
            usage: {
                sort(account) {
                    return account.totalTabletCount;
                },
                align: 'right',
            },
            limit: {
                sort(account) {
                    return account.tabletCountLimit;
                },
                align: 'right',
            },
            free: {
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    tablet_static_memory: {
        group: true,
        items: {
            percentage: {
                sort(account) {
                    return account.tabletStaticMemoryProgress;
                },
                align: 'center',
            },
            usage: {
                sort(account) {
                    return account.totalTabletStaticMemory;
                },
                align: 'right',
            },
            limit: {
                sort(account) {
                    return account.tabletStaticMemoryLimit;
                },
                align: 'right',
            },
            free: {
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    master_memory: {
        group: true,
        items: {
            percentage: {
                sort(account) {
                    return account.masterMemoryProgress;
                },
                align: 'center',
            },
            usage: {
                sort(account) {
                    return account.totalMasterMemory;
                },
                align: 'right',
            },
            limit: {
                sort(account) {
                    return account.masterMemoryLimit;
                },
                align: 'right',
            },
            free: {
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    master_memory_detailed: {
        group: true,
        items: {
            nodes: {
                sort(account) {
                    return account?.master_memory_detailed?.nodes;
                },
                align: 'right',
            },
            chunks: {
                sort(account) {
                    return account?.master_memory_detailed?.chunks;
                },
                align: 'right',
            },
            attributes: {
                sort(account) {
                    return account?.master_memory_detailed?.attributes;
                },
                align: 'right',
            },
            tablets: {
                sort(account) {
                    return account?.master_memory_detailed?.tablets;
                },
                align: 'right',
            },
            schemas: {
                sort(account) {
                    return account?.master_memory_detailed?.schemas;
                },
                align: 'right',
            },
        },
        set: ['nodes', 'chunks', 'attributes', 'tablets', 'schemas'],
    },
    actions: {
        caption: '',
        align: 'center',
    },
};

export const ACCOUNTS_COLUMN_SETS = {
    default: {
        items: [
            'name',
            'disk_space_default',
            'node_count_default',
            'chunk_count_default',
            'actions',
        ],
    },
    disk_space: {
        items: ['name', 'disk_space', 'actions'],
    },
    nodes: {
        items: ['name', 'node_count', 'actions'],
    },
    chunks: {
        items: ['name', 'chunk_count', 'actions'],
    },
    tablets: {
        items: ['name', 'tablet_count', 'actions'],
    },
    tablets_memory: {
        items: ['name', 'tablet_static_memory', 'actions'],
    },
    master_memory: {
        items: ['name', 'master_memory', 'actions'],
    },
    master_memory_detailed: {
        items: ['name', 'master_memory_detailed', 'actions'],
    },
};

const TREE_COLUMN_SETS = _cloneDeep(ACCOUNTS_COLUMN_SETS);
_forEach(TREE_COLUMN_SETS, ({items}) => {
    items.splice(1, 0, 'alerts');
});

export function diskSpaceColumnsItems(mediumType) {
    return {
        disk_space_default: {
            caption: 'Disk space',
            sort(account) {
                const data = account.perMedium[mediumType];

                return data && data.diskSpaceProgress;
            },
            align: 'center',
        },
        disk_space: {
            group: true,
            items: {
                percentage: {
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.diskSpaceProgress;
                    },
                    align: 'center',
                },
                usage: {
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.totalDiskSpace;
                    },
                    align: 'right',
                },
                limit: {
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.diskSpaceLimit;
                    },
                    align: 'right',
                },
                free: {
                    sort() {
                        return undefined;
                    },
                    align: 'right',
                },
            },
            set: ['percentage', 'usage', 'limit', 'free'],
        },
    };
}

const tableSettings = {
    css: 'accounts',
    tableId: ACCOUNTS_TABLE_ID,
    theme: 'light',
    striped: false,
    tree: true,
    computeKey(account) {
        return account.key;
    },
};

export default function getAccountsTableProps(activeAccount, contentMode, mediumType) {
    const settings = Object.assign({}, tableSettings);
    settings.columns = {
        mode: contentMode,
        items: {
            ...columnsItems,
            ...diskSpaceColumnsItems(mediumType),
        },
        sets: TREE_COLUMN_SETS,
    };
    return settings;
}
