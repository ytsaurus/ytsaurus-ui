export const Tab = {
    NODES: 'nodes',
    HTTP_PROXIES: 'http_proxies',
    RPC_PROXIES: 'rpc_proxies',
    VERSIONS: 'versions',
    SHARDS: 'shards',
} as const;

export const DEFAULT_TAB = Tab.VERSIONS;
