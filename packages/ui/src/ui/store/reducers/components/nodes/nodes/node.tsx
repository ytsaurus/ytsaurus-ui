import _ from 'lodash';
import ypath from '../../../../../common/thor/ypath';
import hammer from '../../../../../common/hammer';
import {STACKED_PROGRESS_BAR_COLORS} from '../../../../../constants/colors';
import type {FIX_MY_TYPE} from '../../../../../types';

interface NodeSlots {
    usage: number;
    limits: number;
}

export type TabletSlotState =
    | 'elections'
    | 'follower_recovery'
    | 'following'
    | 'leader_recovery'
    | 'leading'
    | 'none'
    | 'stopped';

interface Memory {
    used: number;
    limit: number;
    progress: number;
}

export interface TabletSlots {
    raw: Array<{state: TabletSlotState}>;
    byState: Partial<Record<TabletSlotState, unknown[]>>;
    all: unknown[];
}

export class Node {
    static ATTRIBUTES = [
        'state',
        'banned',
        'ban_message',
        'decommissioned',
        'decommission_message',
        'alerts',
        'rack',
        'register_time',
        'last_seen_time',
        'stored_replica_count',
        'cached_replica_count',
        'confirmed',
        'available_space',
        'used_space',
        'chunk_count',
        'session_count',
        'cellars',
        'io_weight',
        'resource_usage',
        'resource_limits',
        'resource_limits_overrides',
        'user_tags',
        'tags',
        'data_center',
        'last_seen_time',
        'disable_scheduler_jobs',
        'disable_tablet_cells',
        'disable_write_sessions',
        'version',
        '/annotations/physical_host',
        '/statistics/full',
        '/statistics/locations',
        '/statistics/media',
        '/statistics/memory',
        '/statistics/total_session_count',
        '/statistics/total_stored_chunk_count',
        '/statistics/total_used_space',
        '/statistics/total_available_space',
    ] as const;

    static getResourcesSlots(resourceUsage: unknown, resourceLimits: unknown, key: string) {
        return {
            usage: ypath.getValue(resourceUsage, key),
            limits: ypath.getValue(resourceLimits, key),
        };
    }

    static getColor(index: number) {
        const colors = STACKED_PROGRESS_BAR_COLORS;

        return colors[index % colors.length];
    }

    static prepareProgress(usage: number, limit: number) {
        return limit ? (usage / limit) * 100 : 0;
    }

    alerts!: object[];
    banMessage?: string;
    banned!: boolean;
    chaosSlots!: TabletSlots;
    chunks!: number;
    cpu: unknown;
    cpuProgress!: number;
    cpuText!: string;
    dataCenter!: string;
    decommissioned!: boolean;
    decommissionedMessage?: string;
    disableJobs!: boolean;
    disableTabletCells!: boolean;
    disableWriteSession!: boolean;
    effectiveFlag!: 'decommissioned' | 'full' | 'alerts' | '';
    effectiveState!: Node['state'] | 'banned';
    enabledLocations!: unknown[];
    full!: boolean;
    host: string;
    IOWeight!: {[index: string]: number};
    lastSeenTime!: string;
    locations!: FIX_MY_TYPE[];
    memory: FIX_MY_TYPE;
    memoryData?: Array<{color: string; name: string; value: number}>;
    memoryProgress!: number;
    memoryText!: string;
    memoryTotalText!: string;
    networkProgress!: number;
    networkText!: string;
    physicalHost!: string;
    rack!: string;
    registerTime!: string;
    removalSlots!: NodeSlots;
    removalSlotsProgress!: number;
    repairSlots!: NodeSlots;
    repairSlotsProgress!: number;
    replicationSlots!: NodeSlots;
    replicationSlotsProgress!: number;
    resourcesLimit: unknown;
    resourcesLimitOverrides: unknown;
    sealSlots!: NodeSlots;
    sealSlotsProgress!: number;
    sessions!: number;
    spaceAvailable!: number;
    spaceProgress!: number;
    spaceText!: string;
    spaceTotal!: number;
    spaceUsed!: number;
    state!: 'online' | 'offline' | string;
    systemTags!: string[];
    tabletDynamicMemory!: Memory;
    tabletSlots!: TabletSlots;
    tabletStaticMemory!: Memory;
    tags!: string[];
    userSlots!: NodeSlots;
    userSlotsProgress!: number;
    userTags!: string[];
    version?: string;

    private statistics: unknown;

    constructor(node: FIX_MY_TYPE) {
        this.host = ypath.getValue(node);

        this.prepareDefault(ypath.getAttributes(node));
        this.prepareEffectiveFlag();
        this.prepareIOWeight();
        this.prepareStorage();
        this.prepareResources(ypath.getAttributes(node));
        this.prepareMemory();
        this.prepareTabletsStatistics(ypath.getAttributes(node));
        this.prepareDisableData(ypath.getAttributes(node));
    }

    private prepareDefault(attributes: Attributes) {
        this.statistics = ypath.getValue(attributes, '/statistics');
        this.memory = ypath.getValue(this.statistics, '/memory') || {};

        this.version = ypath.getValue(attributes, '/version');
        this.physicalHost = ypath.getValue(attributes, '/annotations')?.['physical_host'];
        this.dataCenter = ypath.getValue(attributes, '/data_center');
        this.state = ypath.getValue(attributes, '/state');
        this.rack = ypath.getValue(attributes, '/rack');
        this.registerTime = ypath.getValue(attributes, '/register_time');
        this.lastSeenTime = ypath.getValue(attributes, '/last_seen_time');
        this.full = ypath.getValue(this.statistics, '/full');
        this.banned = ypath.getBoolean(attributes, '/banned');
        this.banMessage = ypath.getValue(attributes, '/ban_message');
        this.decommissioned = ypath.getBoolean(attributes, '/decommissioned');
        this.decommissionedMessage = ypath.getValue(attributes, '/decommission_message');
        this.alerts = ypath.getValue(attributes, '/alerts');
        this.effectiveState = this.banned ? 'banned' : this.state;
        this.tags = ypath.getValue(attributes, '/tags');
        this.userTags = _.sortBy(ypath.getValue(attributes, '/user_tags'));
        this.systemTags = _.sortBy(
            _.without(
                this.tags,
                ...this.userTags,
                this.rack,
                this.dataCenter,
                hammer.format['Address'](this.host),
            ),
        );
    }

    private prepareEffectiveFlag() {
        if (this.decommissioned) {
            this.effectiveFlag = 'decommissioned';
        } else if (this.full) {
            this.effectiveFlag = 'full';
        } else if (this.alerts && this.alerts.length > 0) {
            this.effectiveFlag = 'alerts';
        } else {
            this.effectiveFlag = '';
        }
    }

    private prepareIOWeight() {
        const media = ypath.getValue(this.statistics, '/media');

        this.IOWeight = _.reduce(
            media,
            (result, medium, mediumName) => {
                result[mediumName] = medium.io_weight;

                return result;
            },
            {} as Node['IOWeight'],
        );
    }

    private prepareStorage() {
        const spaceUsed = ypath.getValue(this.statistics, '/total_used_space');
        const spaceAvailable = ypath.getValue(this.statistics, '/total_available_space');
        const locations = ypath.getValue(this.statistics, '/locations');
        const spaceTotal = spaceUsed + spaceAvailable;

        this.spaceUsed = spaceUsed;
        this.spaceAvailable = spaceAvailable;
        this.spaceTotal = spaceTotal;

        this.spaceProgress = spaceUsed + spaceAvailable ? (spaceUsed / spaceTotal) * 100 : 0;
        this.spaceText = spaceTotal
            ? hammer.format['Bytes'](spaceUsed, {digits: 2}) +
              ' / ' +
              hammer.format['Bytes'](spaceTotal, {digits: 2})
            : hammer.format.NO_VALUE;

        this.chunks = ypath.getValue(this.statistics, '/total_stored_chunk_count');
        this.sessions = ypath.getValue(this.statistics, '/total_session_count');
        this.locations = _.map(locations, (location) => {
            const locationUsed = ypath.getValue(location, '/used_space');
            const locationAvailable = ypath.getValue(location, '/available_space');
            const locationTotal = locationUsed + locationAvailable;
            return {
                ...location,
                locationProgress: (locationUsed / locationTotal) * 100,
                locationText:
                    hammer.format['Bytes'](locationUsed, {digits: 2}) +
                    ' / ' +
                    hammer.format['Bytes'](locationTotal, {digits: 2}),
            };
        });
        this.enabledLocations = _.filter(this.locations, (location) => location.enabled);
    }

    private prepareResources(attributes: Attributes) {
        const resourceUsage = ypath.getValue(attributes, '/resource_usage');
        const resourceLimits = ypath.getValue(attributes, '/resource_limits');
        this.resourcesLimitOverrides =
            ypath.getValue(attributes, '/resource_limits_overrides') || {};
        this.resourcesLimit = resourceLimits || {};

        // Network
        const networkUsage = ypath.getValue(resourceUsage, '/network');
        const networkLimit = ypath.getValue(resourceLimits, '/network');

        this.networkText =
            typeof networkLimit !== 'undefined' && networkLimit !== 0
                ? hammer.format['Percent']((networkUsage / networkLimit) * 100)
                : hammer.format.NO_VALUE;
        this.networkProgress =
            typeof networkLimit !== 'undefined' && networkLimit !== 0
                ? (networkUsage / networkLimit) * 100
                : networkLimit && 0;

        // CPU
        const cpuUsage = ypath.getValue(resourceUsage, '/cpu');
        const cpuLimit = ypath.getValue(resourceLimits, '/cpu');

        this.cpu = {usage: cpuUsage, limit: cpuLimit};
        this.cpuProgress = Node.prepareProgress(cpuUsage, cpuLimit);
        this.cpuText = cpuLimit
            ? `${Math.round(cpuUsage * 100) / 100} / ${Math.round(cpuLimit * 100) / 100}`
            : hammer.format.NO_VALUE;

        this.repairSlots = Node.getResourcesSlots(resourceUsage, resourceLimits, '/repair_slots');
        this.repairSlotsProgress = Node.prepareProgress(
            this.repairSlots.usage,
            this.repairSlots.limits,
        );

        this.removalSlots = Node.getResourcesSlots(resourceUsage, resourceLimits, '/removal_slots');
        this.removalSlotsProgress = Node.prepareProgress(
            this.removalSlots.usage,
            this.removalSlots.limits,
        );

        this.replicationSlots = Node.getResourcesSlots(
            resourceUsage,
            resourceLimits,
            '/replication_slots',
        );
        this.replicationSlotsProgress = Node.prepareProgress(
            this.replicationSlots.usage,
            this.replicationSlots.limits,
        );

        this.sealSlots = Node.getResourcesSlots(resourceUsage, resourceLimits, '/seal_slots');
        this.sealSlotsProgress = Node.prepareProgress(this.sealSlots.usage, this.sealSlots.limits);

        this.userSlots = Node.getResourcesSlots(resourceUsage, resourceLimits, '/user_slots');
        this.userSlotsProgress = Node.prepareProgress(this.userSlots.usage, this.userSlots.limits);
    }

    private prepareMemory() {
        let memory = this.memory;

        const memoryTotal = ypath.getValue(memory, '/total');
        const memoryLimit = memoryTotal && memoryTotal.limit;

        memory = _.pickBy(memory, (_categoryData, categoryName) => categoryName !== 'total');
        memory = _.map(memory, (categoryData, categoryName) => ({
            rawData: categoryData,
            value:
                typeof memoryLimit !== 'undefined' && memoryLimit !== 0
                    ? (categoryData.used / memoryLimit) * 100
                    : memoryLimit && 0,
            name: categoryName,
        }));
        memory = _.sortBy(memory, 'name');

        let memoryUsage = 0;
        memory = _.map(memory, (categoryData, index: number) => {
            memoryUsage += categoryData.rawData.used || 0;
            categoryData.color = Node.getColor(index);
            return categoryData;
        });

        this.memoryData = memory;

        this.memoryTotalText =
            typeof memoryLimit !== 'undefined'
                ? hammer.format['Percent']((memoryUsage / memoryLimit) * 100, {
                      digits: 2,
                  })
                : hammer.format.NO_VALUE;
        this.memoryText =
            typeof memoryLimit !== 'undefined'
                ? hammer.format['Bytes'](memoryUsage, {digits: 2}) +
                  ' / ' +
                  hammer.format['Bytes'](memoryLimit, {digits: 2})
                : hammer.format.NO_VALUE;
        this.memoryProgress =
            typeof memoryLimit !== 'undefined' && memoryLimit !== 0
                ? (memoryUsage / memoryLimit) * 100
                : memoryLimit && 0;

        // Normalize total progress to not exceed 100% since that would break ProgressBar rendering.
        // At the same time show real values as text labels.
        if (this.memoryProgress > 100) {
            const normalizeBy = 100 / this.memoryProgress;

            this.memoryProgress *= normalizeBy;
            this.memoryData = _.map(memory, (categoryData) => {
                categoryData.value *= normalizeBy;
                return categoryData;
            });
        }
    }

    private prepareTabletsStatistics(attributes: Attributes) {
        this.tabletSlots = prepareTabletSlots(ypath.getValue(attributes, '/cellars/tablet'));
        this.chaosSlots = prepareTabletSlots(ypath.getValue(attributes, '/cellars/chaos'));

        const memory = this.memory;

        const staticUsed = ypath.getValue(memory, '/tablet_static/used');
        const staticLimit = ypath.getValue(memory, '/tablet_static/limit');

        const dynamicUsed = ypath.getValue(memory, '/tablet_dynamic/used');
        const dynamicLimit = ypath.getValue(memory, '/tablet_dynamic/limit');

        this.tabletStaticMemory = {
            used: staticUsed,
            limit: staticLimit,
            progress: (staticUsed / staticLimit) * 100,
        };
        this.tabletDynamicMemory = {
            used: dynamicUsed,
            limit: dynamicLimit,
            progress: (dynamicUsed / dynamicLimit) * 100,
        };
    }

    private prepareDisableData(attributes: Attributes) {
        this.disableWriteSession = ypath.getValue(attributes, '/disable_write_sessions');
        this.disableTabletCells = ypath.getValue(attributes, '/disable_tablet_cells');
        this.disableJobs = ypath.getValue(attributes, '/disable_scheduler_jobs');
    }
}

function prepareTabletSlots(tabletSlots: Array<any>): TabletSlots {
    if (tabletSlots) {
        const states = _.groupBy(tabletSlots, 'state');

        return {
            raw: tabletSlots,
            byState: states,
            all: _.flatten(_.values(states)),
        };
    } else {
        return {
            raw: [],
            byState: {},
            all: [],
        };
    }
}

type AttributeName = (typeof Node.ATTRIBUTES)[number];

type Attributes = Record<AttributeName, FIX_MY_TYPE>;

const alertsAttributes: ReadonlyArray<AttributeName> = ['alerts'];
const bannedAttributes: ReadonlyArray<AttributeName> = ['banned'];
const dataCenterAttributes: ReadonlyArray<AttributeName> = ['data_center'];
const decommissionedAttributes: ReadonlyArray<AttributeName> = ['decommissioned'];
const hostAttributes: ReadonlyArray<AttributeName> = [];
const rackAttributes: ReadonlyArray<AttributeName> = ['rack'];
const resourceLimitsAttributes: ReadonlyArray<AttributeName> = ['resource_limits'];
const resourceUsageAttributes: ReadonlyArray<AttributeName> = ['resource_usage'];
const stateAttributes: ReadonlyArray<AttributeName> = ['state'];
const tagsAttributes: ReadonlyArray<AttributeName> = ['tags'];
const userTagsAttributes: ReadonlyArray<AttributeName> = ['user_tags'];

const cpuAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const fullAttributes: ReadonlyArray<AttributeName> = ['/statistics/full'];
const locationsAttributes: ReadonlyArray<AttributeName> = ['/statistics/locations'];
const memoryAttributes: ReadonlyArray<AttributeName> = ['/statistics/memory'];
const networkAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const removalSlotsAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const repairSlotsAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const replicationSlotsAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const sealSlotsAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);
const spaceAvailableAttributes: ReadonlyArray<AttributeName> = [
    '/statistics/total_available_space',
];
const spaceUsedAttributes: ReadonlyArray<AttributeName> = ['/statistics/total_used_space'];
const spaceTotalAttributes = _.union(spaceUsedAttributes, spaceAvailableAttributes);
const userSlotsAttributes = _.union(resourceUsageAttributes, resourceLimitsAttributes);

export const AttributesByProperty: Record<keyof Node, ReadonlyArray<AttributeName>> = {
    alerts: alertsAttributes,
    banMessage: ['ban_message'],
    banned: bannedAttributes,
    chunks: ['/statistics/total_stored_chunk_count'],
    cpu: cpuAttributes,
    cpuProgress: cpuAttributes,
    cpuText: cpuAttributes,
    dataCenter: dataCenterAttributes,
    decommissioned: decommissionedAttributes,
    decommissionedMessage: ['decommission_message'],
    disableJobs: ['disable_scheduler_jobs'],
    disableTabletCells: ['disable_tablet_cells'],
    disableWriteSession: ['disable_write_sessions'],
    effectiveFlag: _.union(decommissionedAttributes, fullAttributes, alertsAttributes),
    effectiveState: _.union(bannedAttributes, stateAttributes),
    enabledLocations: locationsAttributes,
    full: fullAttributes,
    host: hostAttributes,
    IOWeight: ['/statistics/media'],
    lastSeenTime: ['last_seen_time'],
    locations: locationsAttributes,
    memory: memoryAttributes,
    memoryData: memoryAttributes,
    memoryProgress: memoryAttributes,
    memoryText: memoryAttributes,
    memoryTotalText: memoryAttributes,
    networkProgress: networkAttributes,
    networkText: networkAttributes,
    physicalHost: ['/annotations/physical_host'],
    rack: rackAttributes,
    registerTime: ['register_time'],
    removalSlots: removalSlotsAttributes,
    removalSlotsProgress: removalSlotsAttributes,
    repairSlots: repairSlotsAttributes,
    repairSlotsProgress: repairSlotsAttributes,
    replicationSlots: replicationSlotsAttributes,
    replicationSlotsProgress: replicationSlotsAttributes,
    resourcesLimit: resourceLimitsAttributes,
    resourcesLimitOverrides: ['resource_limits_overrides'],
    sealSlots: sealSlotsAttributes,
    sealSlotsProgress: sealSlotsAttributes,
    sessions: ['/statistics/total_session_count'],
    spaceAvailable: spaceAvailableAttributes,
    spaceProgress: _.union(spaceUsedAttributes, spaceAvailableAttributes, spaceTotalAttributes),
    spaceText: _.union(spaceUsedAttributes, spaceTotalAttributes),
    spaceTotal: spaceTotalAttributes,
    spaceUsed: spaceUsedAttributes,
    state: stateAttributes,
    systemTags: _.union(
        tagsAttributes,
        userTagsAttributes,
        rackAttributes,
        dataCenterAttributes,
        hostAttributes,
    ),
    tabletDynamicMemory: memoryAttributes,
    tabletSlots: ['cellars'],
    chaosSlots: ['cellars'],
    tabletStaticMemory: memoryAttributes,
    tags: tagsAttributes,
    userSlots: userSlotsAttributes,
    userSlotsProgress: userSlotsAttributes,
    userTags: userTagsAttributes,
    version: ['version'],
};
