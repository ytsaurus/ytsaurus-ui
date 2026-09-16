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

import {getContentViewerType} from './contentTypes';

const contentViewers = {
    MapNode,
    AccessAclTab,
    Document,
    Link,
    File,
    Table,
    ReplicatedTable,
    ReplicatedTableMeta,
    Transaction,
    TransactionMap,
};

export default (type: string) => {
    const viewerType = getContentViewerType(type);
    return viewerType ? contentViewers[viewerType] : undefined;
};
