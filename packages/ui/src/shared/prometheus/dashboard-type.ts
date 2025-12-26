export const PROMETHEUS_DASHBOARD_TYPES = [
    // accounts
    'master-accounts',

    // bundles
    'bundle-ui-cpu',
    'bundle-ui-disk',
    'bundle-ui-efficiency',
    'bundle-ui-lsm',
    'bundle-ui-memory',
    'bundle-ui-network',
    'bundle-ui-resource',
    'bundle-ui-rpc-proxy',
    'bundle-ui-rpc-proxy-overview',
    'bundle-ui-user-load',

    // system
    'cluster-resources',
    'master-global',
    'master-local',
    'scheduler-internal',

    // chyt
    'chyt-monitoring',

    // components
    'http-proxies',

    // navigation
    'queue-metrics',
    'queue-consumer-metrics',
    'flow-general',

    // operations
    'scheduler-operation',
    'job',

    // scheduling
    'scheduler-pool',
] as const;

export type PrometheusDashboardType = (typeof PROMETHEUS_DASHBOARD_TYPES)[number];
