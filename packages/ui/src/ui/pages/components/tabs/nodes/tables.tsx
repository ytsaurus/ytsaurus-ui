import React from 'react';

import keys_ from 'lodash/keys';
import map_ from 'lodash/map';
import merge_ from 'lodash/merge';
import reduce_ from 'lodash/reduce';
import sortBy_ from 'lodash/sortBy';

import cn from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';

import {COMPONENTS_NODES_TABLE_ID} from '../../../../constants/components/nodes/nodes';
import {DESC_ASC_UNORDERED, compareArraysBySizeThenByItems} from '../../../../utils/sort-helpers';

import Version from '../../../../pages/components/tabs/nodes/Version';
import StatusBlock, {StatusBlockTheme} from '../../../../components/StatusBlock/StatusBlock';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import NodeActions from '../../../../pages/components/tabs/nodes/NodeActions/NodeActions';
import MemoryProgress from '../../../../pages/components/tabs/nodes/MemoryProgress/MemoryProgress';
import {Host} from '../../../../containers/Host/Host';

import hammer from '../../../../common/hammer';
import {TABLET_SLOTS, renderLabel} from '../../../../components/templates/components/nodes/nodes';
import type {Node, TabletSlotState} from '../../../../store/reducers/components/nodes/nodes/node';
import type {FIX_MY_TYPE} from '../../../../types';
import {NodeColumnBanned, NodeColumnState} from '../../../../pages/components/tabs/NodeColumns';
import {NodesColumnHeader} from '../../../../pages/components/tabs/nodes/Nodes/NodesColumnHeader';
import {ColumnInfo} from '../../../../components/ElementsTable/ElementsTableHeader';
import {progressText} from '../../../../utils/progress';

import './tables.scss';

const block = cn('components-nodes-templates');

export const PropertiesByColumn = {
    __default__: ['IOWeight'],
    actions: ['host'],
    alert_count: ['alertCount'],
    banned: ['banned'],
    chunks: ['chunks'],
    cpu: ['cpuProgress', 'cpuText'],
    cpu_limit: ['cpu'],
    cpu_usage: ['cpu'],
    data_center: ['dataCenter'],
    decommissioned: ['decommissioned'],
    elections: ['tabletSlots'],
    elections_chaos: ['chaosSlots'],
    follower_recovery: ['tabletSlots'],
    follower_recovery_chaos: ['chaosSlots'],
    following: ['tabletSlots'],
    following_chaos: ['chaosSlots'],
    full: ['full'],
    gpu: ['gpu'],
    gpu_usage: ['gpu'],
    gpu_limit: ['gpu'],
    host: ['cluster', 'host'],
    io_weight: ['IOWeight'],
    last_seen: ['lastSeenTime'],
    leader_recovery: ['tabletSlots'],
    leader_recovery_chaos: ['chaosSlots'],
    leading: ['tabletSlots'],
    leading_chaos: ['chaosSlots'],
    locations: ['locations', 'enabledLocations'],
    memory_total: ['memoryProgress', 'memoryTotalText'],
    memory: ['memoryData', 'memoryProgress', 'memoryText'],
    memory_limit: ['memoryTotal'],
    memory_usage: ['memoryTotal'],
    network: ['networkProgress', 'networkText'],
    network_usage: ['network'],
    network_limit: ['network'],
    none: ['tabletSlots'],
    none_chaos: ['chaosSlots'],
    physical_host: ['physicalHost'],
    flavors: ['flavors'],
    rack: ['rack'],
    removal_slots: ['removalSlots', 'removalSlotsProgress'],
    removal_slots_usage: ['removalSlots'],
    removal_slots_limit: ['removalSlots'],
    repair_slots: ['repairSlots', 'repairSlotsProgress'],
    repair_slots_usage: ['repairSlots'],
    repair_slots_limit: ['repairSlots'],
    replication_slots: ['replicationSlots', 'replicationSlotsProgress'],
    replication_slots_usage: ['replicationSlots'],
    replication_slots_limit: ['replicationSlots'],
    scheduler_jobs: ['disableJobs'],
    seal_slots: ['sealSlots', 'sealSlotsProgress'],
    seal_slots_usage: ['sealSlots'],
    seal_slots_limit: ['sealSlots'],
    sessions: ['sessions'],
    space_limit: ['spaceTotal'],
    space_usage: ['spaceUsed'],
    space: ['spaceProgress', 'spaceText'],
    state: ['state'],
    stopped: ['tabletSlots'],
    stopped_chaos: ['chaosSlots'],
    system_tags: ['systemTags'],
    tablet_cells: ['disableTabletCells'],
    tablet_memory_dynamic: ['tabletDynamicMemory'],
    tablet_memory_dynamic_usage: ['tabletDynamicMemory'],
    tablet_memory_dynamic_limit: ['tabletDynamicMemory'],
    tablet_memory_static: ['tabletStaticMemory'],
    tablet_memory_static_usage: ['tabletStaticMemory'],
    tablet_memory_static_limit: ['tabletStaticMemory'],
    tablet_memory: ['tabletStaticMemory', 'tabletDynamicMemory'],
    tablet_slots: ['tabletSlots'],
    user_slots: ['userSlots', 'userSlotsProgress'],
    user_slots_usage: ['userSlots'],
    user_slots_limit: ['userSlots'],
    user_tags: ['userTags'],
    version: ['version'],
    write_sessions: ['disableWriteSession'],
} as const;

export type NodesTableColumnNames = keyof typeof PropertiesByColumn;

export type NodeWithProps<T extends keyof typeof PropertiesByColumn> = Pick<
    Node & {cluster: string},
    (typeof PropertiesByColumn)[T][number]
>;

type ItemDef<P extends keyof typeof PropertiesByColumn> = {
    align?: 'left' | 'center' | 'right';
    get?: (node: NodeWithProps<P>) => void;
    sort?: ((node: NodeWithProps<P>) => void) | boolean;
};

type Items = {
    [P in keyof typeof PropertiesByColumn]?: ItemDef<P> & {
        group?: boolean;
        items?: Record<string, ItemDef<P>>;
        set?: string[];
    };
};

const ioWeight: NonNullable<Items['io_weight']> = {
    group: true,
    items: {
        default: {
            get(node) {
                return node.IOWeight.default;
            },
            sort: true,
            align: 'center',
        },
        cache: {
            get(node) {
                return node.IOWeight.cache;
            },
            sort: true,
            align: 'center',
        },
        ssd_blobs: {
            get(node) {
                return node.IOWeight.ssd_blobs;
            },
            sort: true,
            align: 'center',
        },
        ssd_journals: {
            get(node) {
                return node.IOWeight.ssd_journals;
            },
            sort: true,
            align: 'center',
        },
    },
    set: ['default', 'ssd_blobs', 'ssd_journals'],
};

const nodesTableProps = {
    size: 's',
    virtual: true,
    virtualType: 'simple',
    theme: 'light',
    cssHover: true,
    striped: false,
    tableId: COMPONENTS_NODES_TABLE_ID,
    computeKey(node: NodeWithProps<'host'>) {
        return node.host;
    },
    columns: {
        items: {
            host: {
                get(node) {
                    return node.host;
                },
                sort: true,
                align: 'left',
            },
            physical_host: {
                get(node) {
                    return node.physicalHost;
                },
                sort: true,
                align: 'left',
            },
            flavors: {
                get(node) {
                    return node.flavors;
                },
                sort: true,
                compareFn: compareArraysBySizeThenByItems,
                align: 'left',
            },
            state: {
                get(node) {
                    return node.state;
                },
                sort: true,
                align: 'center',
            },
            data_center: {
                get(node) {
                    return node.dataCenter;
                },
                sort: true,
                caption: 'DC',
                align: 'left',
                tooltipProps: {placement: 'bottom', content: 'Data Center'},
            },
            rack: {
                get(node) {
                    return hammer.format['RackToVector'](node.rack);
                },
                sort: true,
                align: 'left',
            },
            user_tags: {
                get(node) {
                    return node.userTags || -1;
                },
                sort(node) {
                    return !node.userTags?.length ? undefined : node.userTags;
                },
                compareFn: compareArraysBySizeThenByItems,
                align: 'left',
            },
            system_tags: {
                get(node) {
                    return node.systemTags || -1;
                },
                sort(node) {
                    return node.systemTags || [];
                },
                compareFn: compareArraysBySizeThenByItems,
                align: 'left',
            },
            banned: {
                get(item) {
                    return item.banned;
                },
                align: 'center',
                sort: true,
                caption: 'B',
                tooltipProps: {placement: 'bottom', content: 'Banned'},
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            decommissioned: {
                get(item) {
                    return item.decommissioned;
                },
                align: 'center',
                sort: true,
                caption: 'D',
                tooltipProps: {
                    placement: 'bottom',
                    content: 'Decommissioned',
                },
                allowedOrderTypes: DESC_ASC_UNORDERED,
            },
            full: {
                get(item) {
                    return item.full;
                },
                align: 'center',
                sort: true,
                caption: 'F',
                tooltipProps: {placement: 'bottom', content: 'Full'},
            },
            alert_count: {
                get(item) {
                    return item.alertCount;
                },
                sort(item) {
                    return item.alertCount;
                },
                align: 'center',
                caption: 'A',
                tooltipProps: {placement: 'bottom', content: 'Alerts'},
            },
            scheduler_jobs: {
                get(node) {
                    return node.disableJobs;
                },
                sort: true,
                align: 'left',
            },
            write_sessions: {
                get(node) {
                    return node.disableWriteSession;
                },
                sort: true,
                align: 'left',
            },
            tablet_cells: {
                get(node) {
                    return node.disableTabletCells;
                },
                sort: true,
                align: 'left',
            },
            version: {
                get(node) {
                    return node.version;
                },
                sort: true,
                align: 'left',
            },
            last_seen: {
                get(node) {
                    return node.lastSeenTime;
                },
                sort: true,
                align: 'left',
            },
            space: {
                get(node) {
                    return node.spaceProgress;
                },
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="space"
                            title="Space"
                            options={[
                                {
                                    column: 'space',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'space_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'space_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                        />
                    );
                },
                sortWithUndefined: true,
                align: 'center',
            },
            space_limit: {
                get(node) {
                    return node.spaceTotal;
                },
                sort: true,
                sortWithUndefined: true,
                align: 'right',
            },
            space_usage: {
                get(node) {
                    return node.spaceUsed;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            locations: {
                get(node) {
                    return [
                        node.locations && node.locations.length,
                        node.locations && node.enabledLocations.length,
                    ];
                },
                sort: true,
                align: 'center',
            },
            chunks: {
                get(node) {
                    return node.chunks;
                },
                sort: true,
                sortWithUndefined: true,
                align: 'left',
            },
            sessions: {
                get(node) {
                    return node.sessions;
                },
                sort: true,
                sortWithUndefined: true,
                align: 'left',
            },
            cpu: {
                get(node) {
                    return node.cpuProgress;
                },
                sortWithUndefined: true,
                align: 'center',
                renderHeader: ({align}: ColumnInfo) => {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="cpu"
                            options={[
                                {
                                    column: 'cpu',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'cpu_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'cpu_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                            title="CPU"
                        />
                    );
                },
            },
            cpu_limit: {
                get(node) {
                    return node.cpu?.limit;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            cpu_usage: {
                get(node) {
                    return node.cpu?.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            gpu: {
                get(node) {
                    return node.gpu?.progress;
                },
                sortWithUndefined: true,
                align: 'center',
                renderHeader: ({align}: ColumnInfo) => {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="gpu"
                            options={[
                                {
                                    column: 'gpu',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'gpu_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'gpu_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                            title="GPU"
                        />
                    );
                },
            },
            gpu_limit: {
                get(node) {
                    return node.gpu?.limit;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            gpu_usage: {
                get(node) {
                    return node.gpu?.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            memory: {
                get(node) {
                    return node.memoryProgress;
                },
                sortWithUndefined: true,
                renderHeader: ({align}: ColumnInfo) => {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="memory"
                            title="Memory"
                            options={[
                                {
                                    column: 'memory',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'memory_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'memory_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            memory_usage: {
                get(node) {
                    return node.memoryTotal.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            memory_limit: {
                get(node) {
                    return node.memoryTotal.limit;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            memory_total: {
                get(node) {
                    return node.memoryProgress;
                },
                sort: true,
                align: 'center',
            },
            network: {
                get(node) {
                    return node.networkProgress;
                },
                sortWithUndefined: true,
                renderHeader: ({align}: ColumnInfo) => {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="network"
                            title="Network"
                            options={[
                                {
                                    column: 'network',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'network_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'network_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            network_usage: {
                get(node) {
                    return node.network.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            network_limit: {
                get(node) {
                    return node.network.limit;
                },
                sortWithUndefined: true,
                hiddne: true,
            },
            repair_slots: {
                get(node) {
                    return node.repairSlotsProgress;
                },
                sortWithUndefined: true,
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="repair_slots"
                            title="Repair slots"
                            options={[
                                {
                                    column: 'repair_slots',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'repair_slots_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'repair_slots_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            repair_slots_usage: {
                get(node) {
                    return node.repairSlots.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            repair_slots_limit: {
                get(node) {
                    return node.repairSlots.limits;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            removal_slots: {
                get(node) {
                    return node.removalSlotsProgress;
                },
                sortWithUndefined: true,
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="removal_slots"
                            title="Removal slots"
                            options={[
                                {
                                    column: 'removal_slots',
                                    title: 'Progress',
                                    withUndefined: true,
                                    allowUnordered: true,
                                },
                                {
                                    column: 'removal_slots_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                },
                                {
                                    column: 'removal_slots_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            removal_slots_usage: {
                get(node) {
                    return node.removalSlots.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            removal_slots_limit: {
                get(node) {
                    return node.removalSlots.limits;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            replication_slots: {
                get(node) {
                    return node.replicationSlotsProgress;
                },
                sortWithUndefined: true,
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="replication_slots"
                            title="Replication slots"
                            options={[
                                {
                                    column: 'replication_slots',
                                    title: 'Progress',
                                    withUndefined: true,
                                },
                                {
                                    column: 'replication_slots_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                },
                                {
                                    column: 'replication_slots_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            replication_slots_usage: {
                get(node) {
                    return node.replicationSlots.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            replication_slots_limit: {
                get(node) {
                    return node.replicationSlots.limits;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            seal_slots: {
                get(node) {
                    return node.sealSlotsProgress;
                },
                sortWithUndefined: true,
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="seal_slots"
                            title="Seal slots"
                            options={[
                                {
                                    column: 'seal_slots',
                                    title: 'Progress',
                                    withUndefined: true,
                                },
                                {
                                    column: 'seal_slots_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                },
                                {
                                    column: 'seal_slots_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            seal_slots_usage: {
                get(node) {
                    return node.sealSlots.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            seal_slots_limit: {
                get(node) {
                    return node.sealSlots.limits;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            user_slots: {
                get(node) {
                    return node.userSlotsProgress;
                },
                renderHeader({align}: ColumnInfo) {
                    return (
                        <NodesColumnHeader
                            align={align}
                            column="user_slots"
                            title="User slots"
                            options={[
                                {
                                    column: 'user_slots',
                                    title: 'Progress',
                                    withUndefined: true,
                                },
                                {
                                    column: 'user_slots_usage',
                                    title: 'Usage',
                                    withUndefined: true,
                                },
                                {
                                    column: 'user_slots_limit',
                                    title: 'Limit',
                                    withUndefined: true,
                                },
                            ]}
                        />
                    );
                },
                align: 'center',
            },
            user_slots_usage: {
                get(node) {
                    return node.userSlots.usage;
                },
                sortWithUndefined: true,
                hidden: true,
            },
            user_slots_limit: {
                get(node) {
                    return node.userSlots.limits;
                },
                align: 'center',
                sortWithUndefined: true,
                hidden: true,
            },
            tablet_slots: {
                get(node) {
                    if (node.tabletSlots && node.tabletSlots.raw && node.tabletSlots.raw.length) {
                        return reduce_(
                            node.tabletSlots.raw,
                            (sum, slot) => (slot.state === 'none' ? sum : sum + 1),
                            0,
                        );
                    }

                    return -1;
                },
                sort: true,
                align: 'left',
            },
            none: {
                get(node) {
                    return node.tabletSlots?.byState.none;
                },
                sort(node) {
                    return node.tabletSlots?.byState.none?.length;
                },
                //                sort: true,
                align: 'center',
                ...makeCaptionProps('TS None', 'Tablet Slots None'),
            },
            none_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.none;
                },
                sort(node) {
                    return node.chaosSlots?.byState.none?.length;
                },
                //                sort: true,
                align: 'center',
                ...makeCaptionProps('CS None', 'Chaos Slots None'),
            },
            leading: {
                get(node) {
                    return node.tabletSlots?.byState.leading;
                },
                sort(node) {
                    return node.tabletSlots?.byState?.leading?.length;
                },
                align: 'center',
                ...makeCaptionProps('TS Leading', 'Tablet Slots Leading'),
            },
            leading_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.leading;
                },
                sort(node) {
                    return node.chaosSlots?.byState?.leading?.length;
                },
                align: 'center',
                ...makeCaptionProps('CS Leading', 'Chaos Slots Leading'),
            },
            following: {
                get(node) {
                    return node.tabletSlots?.byState.following;
                },
                sort(node) {
                    return node.tabletSlots?.byState?.following?.length;
                },
                align: 'center',
                ...makeCaptionProps('TS Following', 'Tablet Slots Following'),
            },
            following_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.following;
                },
                sort(node) {
                    return node.chaosSlots?.byState?.following?.length;
                },
                align: 'center',
                ...makeCaptionProps('CS Following', 'Chaos Slots Following'),
            },
            follower_recovery: {
                get(node) {
                    return node.tabletSlots?.byState.follower_recovery;
                },
                sort(node) {
                    return node.tabletSlots?.byState.follower_recovery?.length;
                },
                align: 'center',
                ...makeCaptionProps('TS FR', 'Tablet Slots Follower Recovery'),
            },
            follower_recovery_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.follower_recovery;
                },
                sort(node) {
                    return node.chaosSlots?.byState.follower_recovery?.length;
                },
                align: 'center',
                ...makeCaptionProps('CS FR', 'Chaos Slots Follower Recovery'),
            },
            leader_recovery: {
                get(node) {
                    return node.tabletSlots?.byState['leader_recovery'];
                },
                sort: true,
                align: 'center',
                ...makeCaptionProps('TS LR', 'Tablet Slots Leader Recovery'),
            },
            leader_recovery_chaos: {
                get(node) {
                    return node.chaosSlots?.byState['leader_recovery'];
                },
                sort: true,
                align: 'center',
                ...makeCaptionProps('CS LR', 'Chaos Slots Leader Recovery'),
            },
            stopped: {
                get(node) {
                    return node.tabletSlots?.byState.stopped;
                },
                sort(node) {
                    return node.tabletSlots?.byState.stopped?.length;
                },
                align: 'center',
                ...makeCaptionProps('TS Stopped', 'Tablet Slots Stopped'),
            },
            stopped_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.stopped;
                },
                sort(node) {
                    return node.chaosSlots?.byState.stopped?.length;
                },
                align: 'center',
                ...makeCaptionProps('CS Stopped', 'Chaos Slots Stopped'),
            },
            elections: {
                get(node) {
                    return node.tabletSlots?.byState.elections;
                },
                sort(node) {
                    return node.tabletSlots?.byState.elections?.length;
                },
                align: 'center',
                ...makeCaptionProps('TS Elections', 'Tablet Slots Elections'),
            },
            elections_chaos: {
                get(node) {
                    return node.chaosSlots?.byState.elections;
                },
                sort(node) {
                    return node.chaosSlots?.byState.elections?.length;
                },
                align: 'center',
                ...makeCaptionProps('CS Elections', 'Chaos Slots Elections'),
            },
            tablet_memory: {
                group: true,
                items: {
                    static: {
                        get(node) {
                            return node.tabletStaticMemory.progress;
                        },
                        renderHeader: (column: ColumnInfo) => {
                            return (
                                <NodesColumnHeader
                                    column="tablet_memory_static"
                                    align={column.align}
                                    title="Static memory"
                                    options={[
                                        {
                                            column: 'tablet_memory_static',
                                            title: 'Progress',
                                            withUndefined: true,
                                        },
                                        {
                                            column: 'tablet_memory_static_usage',
                                            title: 'Usage',
                                            withUndefined: true,
                                        },
                                        {
                                            column: 'tablet_memory_static_limit',
                                            title: 'Limit',
                                            withUndefined: true,
                                        },
                                    ]}
                                />
                            );
                        },
                        sortWithUndefined: true,
                        align: 'center',
                    },
                    static_usage: {
                        get(node) {
                            return node.tabletStaticMemory.used;
                        },
                        sortWithUndefined: true,
                        hidden: true,
                    },
                    static_limit: {
                        get(node) {
                            return node.tabletStaticMemory.limit;
                        },
                        sortWithUndefined: true,
                        hidden: true,
                    },
                    dynamic: {
                        get(node) {
                            return node.tabletDynamicMemory.progress;
                        },
                        renderHeader: (column: ColumnInfo) => {
                            return (
                                <NodesColumnHeader
                                    column="tablet_memory_dynamic"
                                    align={column.align}
                                    title="Static memory"
                                    options={[
                                        {
                                            column: 'tablet_memory_dynamic',
                                            title: 'Progress',
                                            withUndefined: true,
                                        },
                                        {
                                            column: 'tablet_memory_dynamic_usage',
                                            title: 'Usage',
                                            withUndefined: true,
                                        },
                                        {
                                            column: 'tablet_memory_dynamic_limit',
                                            title: 'Limit',
                                            withUndefined: true,
                                        },
                                    ]}
                                />
                            );
                        },
                        sortWithUndefined: true,
                        align: 'center',
                    },
                    dynamic_usage: {
                        get(node) {
                            return node.tabletDynamicMemory.used;
                        },
                        sortWithUndefined: true,
                        hidden: true,
                    },
                    dynamic_limit: {
                        get(node) {
                            return node.tabletDynamicMemory.limit;
                        },
                        sortWithUndefined: true,
                        hidden: true,
                    },
                },
                set: ['static', 'dynamic'],
            },
            io_weight: ioWeight,
            actions: {
                get(node) {
                    return node.host;
                },
                sort: false,
                caption: '',
                align: 'right',
            },
        } as Items,
        sets: {
            default: {
                items: [
                    'host',
                    'physical_host',
                    'user_tags',
                    'system_tags',
                    'state',
                    'data_center',
                    'rack',
                    'banned',
                    'decommissioned',
                    'full',
                    'alert_count',
                    'version',
                    'last_seen',
                    'actions',
                ],
            },
            storage: {
                items: ['host', 'space', 'sessions', 'chunks', 'io_weight', 'actions'],
            },
            cpu_and_memory: {
                items: ['host', 'cpu', 'memory', 'network', 'actions'],
            },
            resources: {
                items: [
                    'host',
                    'user_slots',
                    'seal_slots',
                    'repair_slots',
                    'removal_slots',
                    'replication_slots',
                    'actions',
                ],
            },
            tablets: {
                items: ['host', 'tablet_slots', 'tablet_memory', 'actions'],
            },
            tablet_slots: {
                items: [
                    'host',
                    'none',
                    'leading',
                    'following',
                    'follower_recovery',
                    'leader_recovery',
                    'stopped',
                    'elections',
                ],
            },
            chaos_slots: {
                items: [
                    'host',
                    'none_chaos',
                    'leading_chaos',
                    'following_chaos',
                    'follower_recovery_chaos',
                    'leader_recovery_chaos',
                    'stopped_chaos',
                    'elections_chaos',
                ],
            },
            custom: {
                items: [
                    'host',
                    'user_tags',
                    'state',
                    'banned',
                    'decommissioned',
                    'full',
                    'alert_count',
                    'last_seen',
                    'actions',
                ],
            },
        },
    },
    templates: {
        data: {
            onMemoryProgressMouseEnter() {},
            onMemoryProgressMouseLeave() {},
        },
    },
};

export const defaultColumns = nodesTableProps.columns.sets.custom.items;

function renderTags(tags?: Array<string | number>, themes?: StatusBlockTheme[], flexType?: 'flex') {
    return tags?.length ? (
        <TagsContainer flexType={flexType}>
            {map_(tags, (tag, index) => (
                <StatusBlock key={tag} theme={themes?.[index]} text={tag} />
            ))}
        </TagsContainer>
    ) : (
        hammer.format.NO_VALUE
    );
}

function TagsContainer({
    children,
    flexType = 'inline-flex',
}: {
    children: React.ReactNode;
    flexType?: 'flex' | 'inline-flex';
}) {
    return (
        <div className={block('tags-container', {inline: 'inline-flex' === flexType})}>
            {children}
        </div>
    );
}

const IO_WEIGHT_PREFIX = 'io_weight_';

type Templates = {
    [P in keyof typeof PropertiesByColumn]?: (
        item: NodeWithProps<P>,
        columnName: string,
    ) => React.ReactNode;
};

export const NODES_TABLE_TEMPLATES: Templates = {
    __default__(item, columnName) {
        if (typeof item.IOWeight === 'object' && columnName.startsWith(IO_WEIGHT_PREFIX)) {
            const mediumName = columnName.slice(IO_WEIGHT_PREFIX.length);

            return hammer.format['Number'](item.IOWeight[mediumName]);
        }
    },
    host(item) {
        return <Host address={item.host} />;
    },
    state(item) {
        return <NodeColumnState state={item.state} />;
    },
    banned(item) {
        return (
            <TagsContainer>
                <NodeColumnBanned banned={item.banned} />
            </TagsContainer>
        );
    },
    decommissioned(item) {
        return item.decommissioned ? renderTags(['D'], ['decommissioned']) : hammer.format.NO_VALUE;
    },
    flavors(item) {
        return renderTags(item.flavors);
    },
    full(item) {
        return item.full ? renderTags(['F'], ['full']) : hammer.format.NO_VALUE;
    },

    alert_count(item) {
        return item.alertCount! > 0
            ? renderTags([String(item.alertCount)], ['alerts'])
            : hammer.format.NO_VALUE;
    },

    physical_host(item, columnName) {
        return (
            <div
                className="elements-column_type_id elements-column_with-hover-button"
                title={item.physicalHost}
            >
                <span className="elements-monospace elements-ellipsis">
                    {hammer.format['Address'](item.physicalHost)}
                </span>
                &nbsp;
                <ClipboardButton
                    text={item.physicalHost}
                    view="flat-secondary"
                    size="s"
                    title={'Copy ' + columnName}
                />
            </div>
        );
    },

    user_tags(item) {
        return renderTags(item.userTags, [], 'flex');
    },

    system_tags(item) {
        return renderTags(item.systemTags, [], 'flex');
    },

    scheduler_jobs(item) {
        return renderLabel(item.disableJobs);
    },
    write_sessions(item) {
        return renderLabel(item.disableWriteSession);
    },
    tablet_cells(item) {
        return renderLabel(item.disableTabletCells);
    },

    data_center(item) {
        return item.dataCenter?.toUpperCase() || hammer.format.NO_VALUE;
    },

    rack(item) {
        return <span className="elements-monospace">{hammer.format['Address'](item.rack)}</span>;
    },

    version(item) {
        const {version} = item;

        return <Version version={version} />;
    },

    last_seen(item) {
        return (
            <span className="elements-ellipsis">
                {hammer.format['DateTime'](item.lastSeenTime, {
                    format: 'full',
                })}
            </span>
        );
    },

    actions(item) {
        return <NodeActions node={item} />;
    },

    space(item) {
        return <Progress value={item.spaceProgress || 0} text={item.spaceText} theme="success" />;
    },

    space_limit(item) {
        return hammer.format['Bytes'](item.spaceTotal);
    },

    locations(item) {
        return item.locations
            ? progressText(item.enabledLocations.length, item.locations.length)
            : null;
    },

    sessions(item) {
        return hammer.format['Number'](item.sessions);
    },

    chunks(item) {
        return hammer.format['Number'](item.chunks);
    },

    io_weight(item) {
        return hammer.format['Number'](item.IOWeight);
    },

    cpu(item) {
        return <Progress value={item.cpuProgress || 0} text={item.cpuText} theme="success" />;
    },

    gpu(item) {
        return (
            <Progress
                value={item.gpu?.progress || 0}
                text={item.gpu?.progressText}
                theme="success"
            />
        );
    },

    memory(item) {
        return (
            <MemoryProgress
                memoryData={item.memoryData}
                memoryText={item.memoryText}
                memoryProgress={item.memoryProgress || 0}
            />
        );
    },

    memory_total(item) {
        return (
            <Progress
                value={item.memoryProgress || 0}
                text={item.memoryTotalText}
                theme="success"
            />
        );
    },

    network(item) {
        return (
            <Progress value={item.networkProgress || 0} text={item.networkText} theme="success" />
        );
    },

    repair_slots(item) {
        const text = progressText(item.repairSlots.usage, item.repairSlots.limits);

        return <Progress value={item.repairSlotsProgress || 0} text={text} theme="success" />;
    },

    removal_slots(item) {
        const text = progressText(item.removalSlots.usage, item.removalSlots.limits);

        return <Progress value={item.removalSlotsProgress || 0} text={text} theme="success" />;
    },

    replication_slots(item) {
        const text = progressText(item.replicationSlots.usage, item.replicationSlots.limits);

        return <Progress value={item.replicationSlotsProgress || 0} text={text} theme="success" />;
    },

    seal_slots(item) {
        const text = progressText(item.sealSlots.usage, item.sealSlots.limits);

        return <Progress value={item.sealSlotsProgress || 0} text={text} theme="success" />;
    },

    user_slots(item) {
        const text = progressText(item.userSlots.usage, item.userSlots.limits);

        return <Progress value={item.userSlotsProgress || 0} text={text} theme="success" />;
    },

    tablet_slots(item) {
        if (item.tabletSlots) {
            const statuses = sortBy_(keys_(item.tabletSlots.byState));

            return (
                <TagsContainer>
                    {map_(statuses, (state: TabletSlotState) => {
                        const tabletSlots = item.tabletSlots.byState[state]!;
                        const {text, theme} = TABLET_SLOTS[state];
                        const label = `${text}: ${tabletSlots.length}`;

                        return <StatusBlock theme={theme} text={label} key={state} />;
                    })}
                </TagsContainer>
            );
        }

        return null;
    },

    none(item) {
        const data = item.tabletSlots?.byState.none;

        return data ? renderTags([data.length]) : hammer.format.NO_VALUE;
    },

    none_chaos(item) {
        const data = item.chaosSlots?.byState.none;

        return data ? renderTags([data.length]) : hammer.format.NO_VALUE;
    },

    leading(item) {
        const data = item.tabletSlots?.byState.leading;

        return data ? renderTags([data.length], ['success']) : hammer.format.NO_VALUE;
    },

    leading_chaos(item) {
        const data = item.chaosSlots?.byState.leading;

        return data ? renderTags([data.length], ['success']) : hammer.format.NO_VALUE;
    },

    following(item) {
        const data = item.tabletSlots?.byState.following;

        return data ? renderTags([data.length], ['info']) : hammer.format.NO_VALUE;
    },

    following_chaos(item) {
        const data = item.chaosSlots?.byState.following;

        return data ? renderTags([data.length], ['info']) : hammer.format.NO_VALUE;
    },

    follower_recovery(item) {
        const data = item.tabletSlots?.byState['follower_recovery'];

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    follower_recovery_chaos(item) {
        const data = item.chaosSlots?.byState['follower_recovery'];

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    leader_recovery(item) {
        const data = item.tabletSlots?.byState['leader_recovery'];

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    leader_recovery_chaos(item) {
        const data = item.chaosSlots?.byState['leader_recovery'];

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    stopped(item) {
        const data = item.tabletSlots?.byState.stopped;

        return data ? renderTags([data.length]) : hammer.format.NO_VALUE;
    },

    stopped_chaos(item) {
        const data = item.chaosSlots?.byState.stopped;

        return data ? renderTags([data.length]) : hammer.format.NO_VALUE;
    },

    elections(item) {
        const data = item.tabletSlots?.byState.elections;

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    elections_chaos(item) {
        const data = item.chaosSlots?.byState.elections;

        return data ? renderTags([data.length], ['warning']) : hammer.format.NO_VALUE;
    },

    tablet_memory_static(item) {
        const text = progressText(item.tabletStaticMemory.used, item.tabletStaticMemory.limit, {
            type: 'bytes',
        });

        return (
            <Progress value={item.tabletStaticMemory.progress || 0} text={text} theme="success" />
        );
    },

    tablet_memory_dynamic(item) {
        const text = progressText(item.tabletDynamicMemory.used, item.tabletDynamicMemory.limit, {
            type: 'bytes',
        });

        return (
            <Progress value={item.tabletDynamicMemory.progress || 0} text={text} theme="success" />
        );
    },
};

export function getNodeTablesProps(mediumList: string[] = []) {
    if (!mediumList?.length) {
        return nodesTableProps;
    }
    const actions = nodesTableProps.columns.items.actions;
    const allMediums = reduce_(
        mediumList,
        (acc, key) => {
            acc[key] = {
                get(node: Node) {
                    return node.IOWeight[key];
                },
                sort: true,
                align: 'center',
            };
            return acc;
        },
        {actions} as {actions: typeof actions} & Record<string, FIX_MY_TYPE>,
    );
    const res = merge_({}, nodesTableProps, {
        columns: {
            items: {
                io_weight: {
                    items: {
                        ...allMediums,
                    },
                    groupHeaderStyle: mediumList.length
                        ? {width: 100 * mediumList.length}
                        : undefined,
                },
            },
        },
        templates: NODES_TABLE_TEMPLATES,
    });
    res.columns!.items!.io_weight!.set = mediumList;
    return res;
}

function makeCaptionProps(columnName: string, title: string) {
    return {
        caption: columnName,
        tooltipProps: {
            placement: 'bottom',
            content: title,
        },
    };
}
