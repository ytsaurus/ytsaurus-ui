import React, {Component} from 'react';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';

import Consumer from '../../../../pages/navigation/tabs/Consumer/Consumer';
import Queue from '../../../../pages/navigation/tabs/Queue/Queue';
import ACL, {AccessAclTab} from '../../../../pages/navigation/tabs/ACL/ACL';
import Locks from '../../../../pages/navigation/tabs/Locks/Locks';
import Schema from '../../../../pages/navigation/tabs/Schema/Schema';
import Tablets from '../../../../pages/navigation/tabs/Tablets/Tablets';
import Attributes from '../../../../pages/navigation/tabs/Attributes/Attributes';
import AccessLog from '../../../../pages/navigation/tabs/AccessLog/AccessLog';
import TabletErrors from '../../../../pages/navigation/tabs/TabletErrors/TabletErrors';
import UserAttributes from '../../../../pages/navigation/tabs/UserAttributes/UserAttributes';
import ReplicatedTable from '../../../../pages/navigation/content/ReplicatedTable/ReplicatedTable';
import ReplicatedTableMeta from '../../content/ReplicatedTable/ReplicatedTableMeta';

import Link from '../../../../pages/navigation/content/Link/Link';
import File from '../../../../pages/navigation/content/File/File';
import Table from '../../../../pages/navigation/content/Table/Table';
import MapNode from '../../../../pages/navigation/content/MapNode/MapNode';
import Document from '../../../../pages/navigation/content/Document/Document';
import Transaction from '../../../../pages/navigation/content/Transaction/Transaction';
import TransactionMap from '../../../../pages/navigation/content/TransactionMap/TransactionMap';
import TableMountConfig from '../../../../pages/navigation/tabs/TableMountConfig/TableMountConfig';

import {Tab} from '../../../../constants/navigation';
import NavigationDescription from '../../NavigationDiscription/NavigationDescription';

const block = cn('navigation');

export default class ContentViewer extends Component {
    static propTypes = {
        type: PropTypes.string.isRequired,
        mode: PropTypes.string.isRequired,
    };

    static supportedContentTypes = {
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

    static supportedAttributeTypes = {
        acl: ACL,
        locks: Locks,
        schema: Schema,
        tablets: Tablets,
        attributes: Attributes,
        tablet_errors: TabletErrors,
        user_attributes: UserAttributes,
        [Tab.ACCESS_LOG]: AccessLog,
        [Tab.AUTO]: true,
        [Tab.CONSUMER]: Consumer,
        [Tab.MOUNT_CONFIG]: TableMountConfig,
        [Tab.QUEUE]: Queue,
    };

    static isSupported(type, mode) {
        if (mode === Tab.CONTENT) {
            return Object.hasOwnProperty.call(ContentViewer.supportedContentTypes, type);
        } else {
            return Object.hasOwnProperty.call(ContentViewer.supportedAttributeTypes, mode);
        }
    }

    get Component() {
        const {type, mode} = this.props;

        return mode === Tab.CONTENT
            ? ContentViewer.supportedContentTypes[type]
            : ContentViewer.supportedAttributeTypes[mode];
    }

    render() {
        const Component = this.Component;
        const {mode} = this.props;
        const isContentTab = mode === Tab.CONTENT;

        return (
            <ErrorBoundary>
                <div className={block('viewer', {mode})}>
                    {isContentTab && <NavigationDescription className={block('description')} />}
                    <Component {...this.props} />
                </div>
            </ErrorBoundary>
        );
    }
}
