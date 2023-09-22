import React from 'react';
import _ from 'lodash';
import {COMPONENTS_NODES_TABLE_ID} from '../../../constants/components/nodes/nodes';
import {DESC_ASC_UNORDERED, compareArraysBySizeThenByItems} from '../../../utils/sort-helpers';

import {Progress} from '@gravity-ui/uikit';
import Version from '../../../pages/components/tabs/nodes/Version';
import StatusBlock from '../../../components/StatusBlock/StatusBlock';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import NodeActions from '../../../pages/components/tabs/nodes/NodeActions/NodeActions';
import MemoryProgress from '../../../pages/components/tabs/nodes/MemoryProgress/MemoryProgress';
import {Host} from '../../../containers/Host/Host';

import hammer from '../../../common/hammer';
import {
    TABLET_SLOTS,
    prepareUsageText,
    renderLabel,
} from '../../../components/templates/components/nodes/nodes';
import type {Node, TabletSlotState} from '../../../store/reducers/components/nodes/nodes/node';
import type {FIX_MY_TYPE} from '../../../types';
import {NodeColumnBanned, NodeColumnState} from '../../../pages/components/tabs/NodeColumns';

export const PropertiesByColumn = {
    __default__: ['IOWeight'],
    actions: ['host'],
    alert_count: ['alertCount'],
    banned: ['banned'],
    chunks: ['chunks'],
    cpu: ['cpuProgress', 'cpuText'],
    data_center: ['dataCenter'],
    decommissioned: ['decommissioned'],
    elections: ['tabletSlots'],
    elections_chaos: ['chaosSlots'],
    follower_recovery: ['tabletSlots'],
    follower_recovery_chaos: ['chaosSlots'],
    following: ['tabletSlots'],
    following_chaos: ['chaosSlots'],
    full: ['full'],
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
    network: ['networkProgress', 'networkText'],
    none: ['tabletSlots'],
    none_chaos: ['chaosSlots'],
    physical_host: ['physicalHost'],
    rack: ['rack'],
    removal_slots: ['removalSlots', 'removalSlotsProgress'],
    repair_slots: ['repairSlots', 'repairSlotsProgress'],
    replication_slots: ['replicationSlots', 'replicationSlotsProgress'],
    scheduler_jobs: ['disableJobs'],
    seal_slots: ['sealSlots', 'sealSlotsProgress'],
    sessions: ['sessions'],
    space_limit: ['spaceAvailable', 'spaceUsed'],
    space: ['spaceAvailable', 'spaceProgress', 'spaceText', 'spaceUsed'],
    state: ['state'],
    stopped: ['tabletSlots'],
    stopped_chaos: ['chaosSlots'],
    system_tags: ['systemTags'],
    tablet_cells: ['disableTabletCells'],
    tablet_memory_dynamic: ['tabletDynamicMemory'],
    tablet_memory_static: ['tabletStaticMemory'],
    tablet_memory: ['tabletStaticMemory', 'tabletDynamicMemory'],
    tablet_slots: ['tabletSlots'],
    user_slots: ['userSlots', 'userSlotsProgress'],
    user_tags: ['userTags'],
    version: ['version'],
    write_sessions: ['disableWriteSession'],
} as const;

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
                    return node.spaceUsed + node.spaceAvailable
                        ? node.spaceUsed / (node.spaceUsed + node.spaceAvailable)
                        : undefined;
                },
                sort: true,
                sortWithUndefined: true,
                align: 'center',
            },
            space_limit: {
                get(node) {
                    return node.spaceUsed + node.spaceAvailable || undefined;
                },
                sort: true,
                sortWithUndefined: true,
                align: 'right',
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
                sort: true,
                align: 'center',
            },
            memory: {
                get(node) {
                    return node.memoryProgress;
                },
                sort: true,
                align: 'center',
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
                sort: true,
                align: 'center',
            },
            repair_slots: {
                get(node) {
                    return node.repairSlots.usage;
                },
                sort: true,
                align: 'center',
            },
            removal_slots: {
                get(node) {
                    return node.removalSlots.usage;
                },
                sort: true,
                align: 'center',
            },
            replication_slots: {
                get(node) {
                    return node.replicationSlots.usage;
                },
                sort: true,
                align: 'center',
            },
            seal_slots: {
                get(node) {
                    return node.sealSlots.usage;
                },
                sort: true,
                align: 'center',
            },
            user_slots: {
                get(node) {
                    return node.userSlots.usage;
                },
                sort: true,
                align: 'center',
            },
            tablet_slots: {
                get(node) {
                    if (node.tabletSlots && node.tabletSlots.raw && node.tabletSlots.raw.length) {
                        return _.reduce(
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
                            return node.tabletStaticMemory.used;
                        },
                        sort: true,
                        sortWithUndefined: true,
                        align: 'center',
                    },
                    dynamic: {
                        get(node) {
                            return [node.tabletDynamicMemory.limit, node.tabletDynamicMemory.used];
                        },
                        sortWithUndefined: true,
                        sort: true,
                        align: 'center',
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

function getTags(tags: string[]) {
    return tags.length > 0
        ? _.map(tags, (tag) => <StatusBlock key={tag} theme="default" text={tag} />)
        : hammer.format.NO_VALUE;
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
        return <Host address={item.host} useText allowByRegexp />;
    },
    state(item) {
        return <NodeColumnState state={item.state} />;
    },
    banned(item) {
        return <NodeColumnBanned banned={item.banned} />;
    },
    decommissioned(item) {
        return item.decommissioned ? (
            <StatusBlock text="D" theme="decommissioned" />
        ) : (
            hammer.format.NO_VALUE
        );
    },
    full(item) {
        return item.full ? <StatusBlock text="F" theme="full" /> : hammer.format.NO_VALUE;
    },

    alert_count(item) {
        return item.alertCount! > 0 ? (
            <StatusBlock text={item.alertCount!} theme="alerts" />
        ) : (
            hammer.format.NO_VALUE
        );
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
        return getTags(item.userTags);
    },

    system_tags(item) {
        return getTags(item.systemTags);
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
        return <Progress value={item.spaceProgress} text={item.spaceText} theme="success" />;
    },

    space_limit(item) {
        return hammer.format['Bytes'](item.spaceUsed + item.spaceAvailable);
    },

    locations(item) {
        return item.locations
            ? prepareUsageText(item.enabledLocations.length, item.locations.length, 'Number')
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
        return <Progress value={item.cpuProgress} text={item.cpuText} theme="success" />;
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
        const text = prepareUsageText(item.repairSlots.usage, item.repairSlots.limits, 'Number');

        return <Progress value={item.repairSlotsProgress} text={text} theme="success" />;
    },

    removal_slots(item) {
        const text = prepareUsageText(item.removalSlots.usage, item.removalSlots.limits, 'Number');

        return <Progress value={item.removalSlotsProgress} text={text} theme="success" />;
    },

    replication_slots(item) {
        const text = prepareUsageText(
            item.replicationSlots.usage,
            item.replicationSlots.limits,
            'Number',
        );

        return <Progress value={item.replicationSlotsProgress} text={text} theme="success" />;
    },

    seal_slots(item) {
        const text = prepareUsageText(item.sealSlots.usage, item.sealSlots.limits, 'Number');

        return <Progress value={item.sealSlotsProgress} text={text} theme="success" />;
    },

    user_slots(item) {
        const text = prepareUsageText(item.userSlots.usage, item.userSlots.limits, 'Number');

        return <Progress value={item.userSlotsProgress} text={text} theme="success" />;
    },

    tablet_slots(item) {
        if (item.tabletSlots) {
            const statuses = _.sortBy(_.keys(item.tabletSlots.byState));

            return _.map(statuses, (state: TabletSlotState) => {
                const tabletSlots = item.tabletSlots.byState[state]!;
                const {text, theme} = TABLET_SLOTS[state];
                const label = `${text}: ${tabletSlots.length}`;

                return <StatusBlock theme={theme} text={label} key={state} />;
            });
        }

        return null;
    },

    none(item) {
        const data = item.tabletSlots?.byState.none;

        return data ? <StatusBlock text={data.length} theme="default" /> : hammer.format.NO_VALUE;
    },

    none_chaos(item) {
        const data = item.chaosSlots?.byState.none;

        return data ? <StatusBlock text={data.length} theme="default" /> : hammer.format.NO_VALUE;
    },

    leading(item) {
        const data = item.tabletSlots?.byState.leading;

        return data ? <StatusBlock text={data.length} theme="success" /> : hammer.format.NO_VALUE;
    },

    leading_chaos(item) {
        const data = item.chaosSlots?.byState.leading;

        return data ? <StatusBlock text={data.length} theme="success" /> : hammer.format.NO_VALUE;
    },

    following(item) {
        const data = item.tabletSlots?.byState.following;

        return data ? <StatusBlock text={data.length} theme="info" /> : hammer.format.NO_VALUE;
    },

    following_chaos(item) {
        const data = item.chaosSlots?.byState.following;

        return data ? <StatusBlock text={data.length} theme="info" /> : hammer.format.NO_VALUE;
    },

    follower_recovery(item) {
        const data = item.tabletSlots?.byState['follower_recovery'];

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    follower_recovery_chaos(item) {
        const data = item.chaosSlots?.byState['follower_recovery'];

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    leader_recovery(item) {
        const data = item.tabletSlots?.byState['leader_recovery'];

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    leader_recovery_chaos(item) {
        const data = item.chaosSlots?.byState['leader_recovery'];

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    stopped(item) {
        const data = item.tabletSlots?.byState.stopped;

        return data ? <StatusBlock text={data.length} theme="default" /> : hammer.format.NO_VALUE;
    },

    stopped_chaos(item) {
        const data = item.chaosSlots?.byState.stopped;

        return data ? <StatusBlock text={data.length} theme="default" /> : hammer.format.NO_VALUE;
    },

    elections(item) {
        const data = item.tabletSlots?.byState.elections;

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    elections_chaos(item) {
        const data = item.chaosSlots?.byState.elections;

        return data ? <StatusBlock text={data.length} theme="warning" /> : hammer.format.NO_VALUE;
    },

    tablet_memory_static(item) {
        const text = prepareUsageText(
            item.tabletStaticMemory.used,
            item.tabletStaticMemory.limit,
            'Bytes',
        );

        return (
            <Progress value={item.tabletStaticMemory.progress || 0} text={text} theme="success" />
        );
    },

    tablet_memory_dynamic(item) {
        const text = prepareUsageText(
            item.tabletDynamicMemory.used,
            item.tabletDynamicMemory.limit,
            'Bytes',
        );

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
    const allMediums = _.reduce(
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
    const res = _.merge({}, nodesTableProps, {
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
