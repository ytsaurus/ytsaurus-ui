export const isFolderNode = (nodeType?: string) => {
    if (!nodeType) return false;
    return [
        'map_node',
        'scheduler_pool_tree_map',
        'topmost_transaction_map',
        'transaction_map',
        'link',
        'rootstock',
        'portal_entrance',
    ].includes(nodeType);
};
