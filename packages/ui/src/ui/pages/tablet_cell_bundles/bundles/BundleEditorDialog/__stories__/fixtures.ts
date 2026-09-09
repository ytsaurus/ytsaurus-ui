import {
    type BundleDefaultConfig,
    type OrchidBundlesData,
    type TabletBundle,
} from '../../../../../store/reducers/tablet_cell_bundles';

export const bundleName = 'production_bundle';

const normalRpc = {memory: 4_000_000_000, vcpu: 2000, net: 1_000_000_000};
const deprecatedRpc = {memory: 8_000_000_000, vcpu: 4000, net: 2_000_000_000};
const normalNode = {memory: 16_000_000_000, vcpu: 8000, net: 2_000_000_000};
const deprecatedNode = {memory: 32_000_000_000, vcpu: 16000, net: 4_000_000_000};

export const bundleData = {
    bundle: bundleName,
    zone: 'zone_default',
    enable_bundle_controller: true,
    changelog_account: 'sys',
    snapshot_account: 'sys',
    bundle_controller_target_config: {
        rpc_proxy_count: 2,
        rpc_proxy_resource_guarantee: {...normalRpc, type: 'rpc-small'},
        tablet_node_count: 3,
        tablet_node_resource_guarantee: {...normalNode, type: 'node-small'},
        memory_limits: {reserved: 2_000_000_000, tablet_static: 1_000_000_000},
        cpu_limits: {write_thread_pool_size: 4, lookup_thread_pool_size: 2},
    },
} as TabletBundle;

export const bundleEditorData = {
    $attributes: {
        abc: {slug: 'yt'},
        options: {changelog_account: 'sys', snapshot_account: 'sys'},
        resource_usage: {tablet_count: 12, tablet_static_memory: 1_000_000_000},
        resource_limits: {tablet_count: 100, tablet_static_memory: 20_000_000_000},
    },
};

const emptyAllocations = {
    assigned_spare_tablet_nodes: {},
    allocated_tablet_nodes: {},
    allocating_tablet_nodes: {},
    allocating_tablet_node_count: 0,
    deallocating_tablet_node_count: 0,
    assigned_spare_rpc_proxies: {},
    allocated_rpc_proxies: {},
    allocating_rpc_proxies: {},
    allocating_rpc_proxy_count: 0,
    deallocating_rpc_proxy_count: 0,
};

export const bundleControllerData: OrchidBundlesData = {
    alerts: [],
    ...emptyAllocations,
    removing_cell_count: 0,
    resource_quota: {memory: 500_000_000_000, vcpu: 100_000},
    resource_allocated: {memory: 100_000_000_000, vcpu: 20_000},
};

export const bundleDefaultConfig: BundleDefaultConfig = {
    zone_default: {
        rpc_proxy_sizes: {
            'rpc-small': {resource_guarantee: normalRpc},
            'rpc-legacy': {
                resource_guarantee: deprecatedRpc,
                deprecated: true,
                deprecation_reason: 'Use rpc-small instead',
            },
            'rpc-legacy-without-a-reason': {
                resource_guarantee: deprecatedRpc,
                deprecated: true,
            },
        },
        tablet_node_sizes: {
            'node-small': {
                resource_guarantee: normalNode,
                default_config: {
                    memory_limits: {reserved: 2_000_000_000, tablet_static: 1_000_000_000},
                    cpu_limits: {write_thread_pool_size: 4},
                },
            },
            'node-legacy-with-an-intentionally-long-configuration-name': {
                resource_guarantee: deprecatedNode,
                deprecated: true,
                deprecation_reason: 'Migrate this bundle to node-small',
                default_config: {
                    memory_limits: {reserved: 7_000_000_000, tablet_static: 3_000_000_000},
                    cpu_limits: {write_thread_pool_size: 12, query_thread_pool_size: 12},
                },
            },
            'node-legacy-without-reason': {
                resource_guarantee: deprecatedNode,
                deprecated: true,
                default_config: {
                    memory_limits: {reserved: 6_000_000_000},
                    cpu_limits: {write_thread_pool_size: 10},
                },
            },
        },
        data_centers: {},
    },
};
