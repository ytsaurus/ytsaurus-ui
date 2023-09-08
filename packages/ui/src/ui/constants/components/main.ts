export const Tab = {
    NODES: 'nodes',
    HTTP_PROXIES: 'http_proxies',
    RPC_PROXIES: 'rpc_proxies',
    VERSIONS: 'versions',
    SHARDS: 'shards',
    TABLET_CELLS: 'tablet_cells',
} as const;

export const DEFAULT_TAB = Tab.VERSIONS;
