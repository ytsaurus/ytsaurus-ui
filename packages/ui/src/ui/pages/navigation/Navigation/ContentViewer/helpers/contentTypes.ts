export const contentTypes = {
    map_node: 'MapNode',
    portal_entrance: 'MapNode',
    portal_exit: 'MapNode',
    rootstock: 'MapNode',
    scion: 'MapNode',
    cell_node_map: 'MapNode',
    sys_node: 'MapNode',
    access_control_object_namespace_map: 'MapNode',
    access_control_object_namespace: 'MapNode',
    access_control_object: 'AccessAclTab',
    tablet_cell: 'MapNode',
    chaos_cell: 'MapNode',
    scheduler_pool_tree_map: 'MapNode',
    scheduler_pool: 'MapNode',
    document: 'Document',
    string_node: 'Document',
    int64_node: 'Document',
    uint64_node: 'Document',
    double_node: 'Document',
    boolean_node: 'Document',
    link: 'Link',
    file: 'File',
    table: 'Table',
    replicated_table: 'ReplicatedTable',
    chaos_replicated_table: 'ReplicatedTable',
    replication_log_table: 'ReplicatedTableMeta',
    transaction: 'Transaction',
    nested_transaction: 'Transaction',
    topmost_transaction_map: 'TransactionMap',
    transaction_map: 'TransactionMap',
    hunk_storage: 'MapNode',
} as const;

export function getContentViewerType(type: string) {
    return Object.prototype.hasOwnProperty.call(contentTypes, type)
        ? contentTypes[type as keyof typeof contentTypes]
        : undefined;
}
