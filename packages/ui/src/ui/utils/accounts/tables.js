import {ACCOUNTS_TABLE_ID} from '../../constants/accounts/accounts';
import cloneDeep_ from 'lodash/cloneDeep';
import forEach_ from 'lodash/forEach';
import i18n from './i18n';

export const columnsItems = {
    name: {
        get caption() {
            return i18n('field_name');
        },
        sort(account) {
            return account.name;
        },
        align: 'left',
    },
    alerts: {
        get caption() {
            return i18n('field_alerts');
        },
        tooltipProps: {
            get content() {
                return i18n('context_alerts');
            },
        },
        sort(item) {
            return item.alertsCount;
        },
        align: 'center',
    },
    node_count_default: {
        get caption() {
            return i18n('field_nodes');
        },
        sort(account) {
            return account.nodeCountProgress;
        },
        align: 'center',
    },
    node_count: {
        group: true,
        get caption() {
            return i18n('field_nodes');
        },
        items: {
            percentage: {
                get caption() {
                    return i18n('field_percentage');
                },
                sort(account) {
                    return account.nodeCountProgress;
                },
                align: 'center',
            },
            usage: {
                get caption() {
                    return i18n('field_usage');
                },
                sort(account) {
                    return account.totalNodeCount;
                },
                align: 'right',
            },
            limit: {
                get caption() {
                    return i18n('field_limit');
                },
                sort(account) {
                    return account.nodeCountLimit;
                },
                align: 'right',
            },
            free: {
                get caption() {
                    return i18n('field_free');
                },
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    chunk_count_default: {
        get caption() {
            return i18n('field_chunks');
        },
        sort(account) {
            return account.chunkCountProgress;
        },
        align: 'center',
    },
    chunk_count: {
        get caption() {
            return i18n('field_chunks');
        },
        group: true,
        items: {
            percentage: {
                get caption() {
                    return i18n('field_percentage');
                },
                sort(account) {
                    return account.chunkCountProgress;
                },
                align: 'center',
            },
            usage: {
                get caption() {
                    return i18n('field_usage');
                },
                sort(account) {
                    return account.totalChunkCount;
                },
                align: 'right',
            },
            limit: {
                get caption() {
                    return i18n('field_limit');
                },
                sort(account) {
                    return account.chunkCountLimit;
                },
                align: 'right',
            },
            free: {
                get caption() {
                    return i18n('field_free');
                },
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    tablet_count: {
        get caption() {
            return i18n('field_tablets');
        },
        group: true,
        items: {
            percentage: {
                get caption() {
                    return i18n('field_percentage');
                },
                sort(account) {
                    return account.tabletCountProgress;
                },
                align: 'center',
            },
            usage: {
                get caption() {
                    return i18n('field_usage');
                },
                sort(account) {
                    return account.totalTabletCount;
                },
                align: 'right',
            },
            limit: {
                get caption() {
                    return i18n('field_limit');
                },
                sort(account) {
                    return account.tabletCountLimit;
                },
                align: 'right',
            },
            free: {
                get caption() {
                    return i18n('field_free');
                },
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    tablet_static_memory: {
        get caption() {
            return i18n('field_tablet-memory');
        },
        group: true,
        items: {
            percentage: {
                get caption() {
                    return i18n('field_percentage');
                },
                sort(account) {
                    return account.tabletStaticMemoryProgress;
                },
                align: 'center',
            },
            usage: {
                get caption() {
                    return i18n('field_usage');
                },
                sort(account) {
                    return account.totalTabletStaticMemory;
                },
                align: 'right',
            },
            limit: {
                get caption() {
                    return i18n('field_limit');
                },
                sort(account) {
                    return account.tabletStaticMemoryLimit;
                },
                align: 'right',
            },
            free: {
                get caption() {
                    return i18n('field_free');
                },
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    master_memory: {
        get caption() {
            return i18n('field_master-memory');
        },
        group: true,
        items: {
            percentage: {
                get caption() {
                    return i18n('field_percentage');
                },
                sort(account) {
                    return account.masterMemoryProgress;
                },
                align: 'center',
            },
            usage: {
                get caption() {
                    return i18n('field_usage');
                },
                sort(account) {
                    return account.totalMasterMemory;
                },
                align: 'right',
            },
            limit: {
                get caption() {
                    return i18n('field_limit');
                },
                sort(account) {
                    return account.masterMemoryLimit;
                },
                align: 'right',
            },
            free: {
                get caption() {
                    return i18n('field_free');
                },
                sort() {
                    return undefined;
                },
                align: 'right',
            },
        },
        set: ['percentage', 'usage', 'limit', 'free'],
    },
    master_memory_detailed: {
        get caption() {
            return i18n('field_master-memory-detailed');
        },
        group: true,
        items: {
            nodes: {
                get caption() {
                    return i18n('field_nodes');
                },
                sort(account) {
                    return account?.master_memory_detailed?.nodes;
                },
                align: 'right',
            },
            chunks: {
                get caption() {
                    return i18n('field_chunks');
                },
                sort(account) {
                    return account?.master_memory_detailed?.chunks;
                },
                align: 'right',
            },
            attributes: {
                get caption() {
                    return i18n('field_attributes');
                },
                sort(account) {
                    return account?.master_memory_detailed?.attributes;
                },
                align: 'right',
            },
            tablets: {
                get caption() {
                    return i18n('field_tablets');
                },
                sort(account) {
                    return account?.master_memory_detailed?.tablets;
                },
                align: 'right',
            },
            schemas: {
                get caption() {
                    return i18n('field_schemas');
                },
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

const TREE_COLUMN_SETS = cloneDeep_(ACCOUNTS_COLUMN_SETS);
forEach_(TREE_COLUMN_SETS, ({items}) => {
    items.splice(1, 0, 'alerts');
});

export function diskSpaceColumnsItems(mediumType) {
    return {
        disk_space_default: {
            get caption() {
                return i18n('field_disk-space');
            },
            sort(account) {
                const data = account.perMedium[mediumType];

                return data && data.diskSpaceProgress;
            },
            align: 'center',
        },
        disk_space: {
            get caption() {
                return i18n('field_disk-space');
            },
            group: true,
            items: {
                percentage: {
                    get caption() {
                        return i18n('field_percentage');
                    },
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.diskSpaceProgress;
                    },
                    align: 'center',
                },
                usage: {
                    get caption() {
                        return i18n('field_usage');
                    },
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.totalDiskSpace;
                    },
                    align: 'right',
                },
                limit: {
                    get caption() {
                        return i18n('field_limit');
                    },
                    sort(account) {
                        const data = account.perMedium[mediumType];

                        return data && data.diskSpaceLimit;
                    },
                    align: 'right',
                },
                free: {
                    get caption() {
                        return i18n('field_free');
                    },
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
