import {AccessAclTab} from '../../../tabs/ACL/ACL';
import ReplicatedTable from '../../../../../pages/navigation/content/ReplicatedTable/ReplicatedTable';
import ReplicatedTableMeta from '../../../content/ReplicatedTable/ReplicatedTableMeta';

import Link from '../../../../../pages/navigation/content/Link/Link';
import File from '../../../../../pages/navigation/content/File/File';
import Table from '../../../../../pages/navigation/content/Table/Table';
import MapNode from '../../../../../pages/navigation/content/MapNode/MapNode';
import Document from '../../../content/Document/DocumentWithRum';
import Transaction from '../../../../../pages/navigation/content/Transaction/Transaction';
import TransactionMap from '../../../../../pages/navigation/content/TransactionMap/TransactionMap';

const supportedContentTypes = {
    map_node: MapNode,
    portal_entrance: MapNode,
    portal_exit: MapNode,
    cell_node_map: MapNode,
    sys_node: MapNode,
    access_control_object_namespace_map: MapNode,
    access_control_object_namespace: MapNode,
    access_control_object: AccessAclTab,
    tablet_cell: MapNode,
    scheduler_pool_tree_map: MapNode,
    scheduler_pool: MapNode,
    document: Document,
    string_node: Document,
    int64_node: Document,
    uint64_node: Document,
    double_node: Document,
    boolean_node: Document,
    link: Link,
    file: File,
    table: Table,
    replicated_table: ReplicatedTable,
    chaos_replicated_table: ReplicatedTable,
    replication_log_table: ReplicatedTableMeta,
    transaction: Transaction,
    nested_transaction: Transaction,
    topmost_transaction_map: TransactionMap,
    transaction_map: TransactionMap,
};

export default (type: string) => supportedContentTypes[type as keyof typeof supportedContentTypes];
