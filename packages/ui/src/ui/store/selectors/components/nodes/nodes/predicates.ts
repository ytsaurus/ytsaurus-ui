import _ from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../../../../../store/reducers';
import type {Node} from '../../../../../store/reducers/components/nodes/nodes/node';
import {
    FlagState,
    NodeRange,
    TagFilter,
    groupFilterInitialState,
} from '../../../../../store/reducers/components/nodes/setup/setup';
import {MEDIUM_COLS_PREFIX} from '../../../../../constants/components/nodes/nodes';
import {getMediumListNoCache} from '../../../../../store/selectors/thor';
import type {ValueOf} from '../../../../../types';

const getSetupFiltersRaw = (state: RootState) => state.components.nodes.setup;

export const getNodes = (state: RootState): Array<Node> => state.components.nodes.nodes.nodes;

export const getComponentNodesFiltersSetup = createSelector(
    [getSetupFiltersRaw, getMediumListNoCache],
    (setup, mediumList) => {
        const mediumDefaults = _.reduce(
            mediumList,
            (acc, medium) => {
                acc[MEDIUM_COLS_PREFIX + medium] = _.cloneDeep(groupFilterInitialState);
                return acc;
            },
            {} as Record<string, NodeRange>,
        );
        return _.merge({}, {storage: mediumDefaults}, setup);
    },
);

export const getComponentNodesIndexByTag = createSelector([getNodes], (nodes) => {
    const res = _.reduce(
        nodes,
        (acc, node) => {
            const {tags} = node;
            _.forEach(tags, (tag) => {
                if (acc[tag]) {
                    acc[tag].add(node);
                } else {
                    acc[tag] = new Set([node]);
                }
            });
            return acc;
        },
        {} as Record<string, Set<Node>>,
    );
    return res;
});

const PropertiesByPredicate = {
    physicalHost: ['physicalHost'],
    tags: ['tags'],
    state: ['state'],
    rack: ['rack'],
    banned: ['banned'],
    decommissioned: ['decommissioned'],
    full: ['full'],
    alertCount: ['alertCount'],
    disableJobs: ['disableJobs'],
    disableWriteSession: ['disableWriteSession'],
    disableTabletCells: ['disableTabletCells'],
    sessions: ['sessions'],
    chunks: ['chunks'],
    spaceUsed: ['spaceUsed'],
    spaceTotal: ['spaceTotal'],
    blobSession: ['memory'],
    blockCache: ['memory'],
    chunkBlockMeta: ['memory'],
    chunkMeta: ['memory'],
    footprint: ['memory'],
    query: ['memory'],
    systemJobs: ['memory'],
    versionedChunkMeta: ['memory'],
    tabletDynamicUsed: ['memory'],
    tabletDynamicTotal: ['memory'],
    tabletStaticUsed: ['memory'],
    tabletStaticTotal: ['memory'],
    userJobsUsed: ['memory'],
    userJobsTotal: ['memory'],
    userSlotsUsed: ['userSlots'],
    userSlotsTotal: ['userSlots'],
    sealSlotsUsed: ['sealSlots'],
    sealSlotsTotal: ['sealSlots'],
    repairSlotsUsed: ['repairSlots'],
    repairSlotsTotal: ['repairSlots'],
    removalSlotsUsed: ['removalSlots'],
    removalSlotsTotal: ['removalSlots'],
    replicationSlotsUsed: ['replicationSlots'],
    replicationSlotsTotal: ['replicationSlots'],
    all: ['tabletSlots'],
    none: ['tabletSlots'],
    leading: ['tabletSlots'],
    following: ['tabletSlots'],
    followerRecovery: ['tabletSlots'],
    leaderRecovery: ['tabletSlots'],
    stopped: ['tabletSlots'],
    elections: ['tabletSlots'],
    staticUsed: ['tabletStaticMemory'],
    staticTotal: ['tabletStaticMemory'],
    dynamicUsed: ['tabletDynamicMemory'],
    dynamicTotal: ['tabletDynamicMemory'],
} as const;

type NodeWithProps<T extends keyof typeof PropertiesByPredicate> = Pick<
    Node,
    (typeof PropertiesByPredicate)[T][number]
>;

type Predicates = {
    [P in keyof typeof PropertiesByPredicate]:
        | false
        | undefined
        | ((node: NodeWithProps<P>) => boolean);
};

const getFilterPredicatesObject = createSelector(
    [getSetupFiltersRaw, getComponentNodesIndexByTag],
    (setupFilters, nodesByTags) => {
        const predicates: Predicates = {
            // filter by default
            physicalHost:
                Boolean(setupFilters.default.physicalHost) &&
                ((node) => {
                    return -1 !== node.physicalHost?.indexOf(setupFilters.default.physicalHost);
                }),
            tags: createNodeTagPredicate(setupFilters.default.tag, nodesByTags),
            state:
                setupFilters.default.state !== 'all' &&
                ((node) => {
                    return setupFilters.default.state === node.state;
                }),
            rack:
                Boolean(setupFilters.default.rack) &&
                ((node) => {
                    const rack: string = setupFilters.default.rack.toLowerCase();
                    if (rack === 'unaware' && !node.rack) {
                        return true;
                    }
                    return node.rack?.toLowerCase().startsWith(rack.toLowerCase());
                }),

            banned: createFlagPredicate('banned', setupFilters.default.banned),
            decommissioned: createFlagPredicate(
                'decommissioned',
                setupFilters.default.decommissioned,
            ),
            full: createFlagPredicate('full', setupFilters.default.full),
            alertCount: createAlertsFlagPredicate(setupFilters.default.alertCount),

            disableJobs: createAttributeStatePredicate(
                'disableJobs',
                setupFilters.default.schedulerJobs,
            ),
            disableWriteSession: createAttributeStatePredicate(
                'disableWriteSession',
                setupFilters.default.writeSessions,
            ),
            disableTabletCells: createAttributeStatePredicate(
                'disableTabletCells',
                setupFilters.default.tabletCells,
            ),

            // filter by storage
            sessions: createRangePredicate(
                setupFilters.storage.sessions,
                'sessions',
                (node) => node,
            ),
            chunks: createRangePredicate(setupFilters.storage.chunks, 'chunks', (node) => node),
            spaceUsed: createRangePredicate(
                setupFilters.storage.spaceUsed,
                'spaceUsed',
                (node) => node,
            ),
            spaceTotal: createRangePredicate(
                setupFilters.storage.spaceTotal,
                'spaceTotal',
                (node) => node,
            ),

            // filter by cpu
            blobSession: createRangePredicate(
                setupFilters.cpu.blobSession,
                'used',
                (node) => node.memory.blob_session,
            ),
            blockCache: createRangePredicate(
                setupFilters.cpu.blockCache,
                'used',
                (node) => node.memory.block_cache,
            ),
            chunkBlockMeta: createRangePredicate(
                setupFilters.cpu.chunkBlockMeta,
                'used',
                (node) => node.memory.chunk_block_meta,
            ),
            chunkMeta: createRangePredicate(
                setupFilters.cpu.chunkMeta,
                'used',
                (node) => node.memory.chunk_meta,
            ),
            footprint: createRangePredicate(
                setupFilters.cpu.footprint,
                'used',
                (node) => node.memory.footprint,
            ),
            query: createRangePredicate(
                setupFilters.cpu.query,
                'used',
                (node) => node.memory.query,
            ),
            systemJobs: createRangePredicate(
                setupFilters.cpu.systemJobs,
                'used',
                (node) => node.memory.system_jobs,
            ),
            versionedChunkMeta: createRangePredicate(
                setupFilters.cpu.versionedChunkMeta,
                'used',
                (node) => node.memory.versioned_chunk_meta,
            ),

            tabletDynamicUsed: createRangePredicate(
                setupFilters.cpu.tabletDynamicUsed,
                'used',
                (node) => node.memory.tablet_dynamic,
            ),
            tabletDynamicTotal: createRangePredicate(
                setupFilters.cpu.tabletDynamicTotal,
                'limit',
                (node) => node.memory.tablet_dynamic,
            ),

            tabletStaticUsed: createRangePredicate(
                setupFilters.cpu.tabletStaticUsed,
                'used',
                (node) => node.memory.tablet_static,
            ),
            tabletStaticTotal: createRangePredicate(
                setupFilters.cpu.tabletStaticTotal,
                'limit',
                (node) => node.memory.tablet_static,
            ),

            userJobsUsed: createRangePredicate(
                setupFilters.cpu.userJobsUsed,
                'used',
                (node) => node.memory.user_jobs,
            ),
            userJobsTotal: createRangePredicate(
                setupFilters.cpu.userJobsTotal,
                'limit',
                (node) => node.memory.user_jobs,
            ),

            // filter by resources
            userSlotsUsed: createRangePredicate(
                setupFilters.resources.userSlotsUsed,
                'usage',
                (node) => node.userSlots,
            ),
            userSlotsTotal: createRangePredicate(
                setupFilters.resources.userSlotsTotal,
                'limits',
                (node) => node.userSlots,
            ),
            sealSlotsUsed: createRangePredicate(
                setupFilters.resources.sealSlotsUsed,
                'usage',
                (node) => node.sealSlots,
            ),
            sealSlotsTotal: createRangePredicate(
                setupFilters.resources.sealSlotsTotal,
                'limits',
                (node) => node.sealSlots,
            ),
            repairSlotsUsed: createRangePredicate(
                setupFilters.resources.repairSlotsUsed,
                'usage',
                (node) => node.repairSlots,
            ),
            repairSlotsTotal: createRangePredicate(
                setupFilters.resources.repairSlotsTotal,
                'limits',
                (node) => node.repairSlots,
            ),
            removalSlotsUsed: createRangePredicate(
                setupFilters.resources.removalSlotsUsed,
                'usage',
                (node) => node.removalSlots,
            ),
            removalSlotsTotal: createRangePredicate(
                setupFilters.resources.removalSlotsTotal,
                'limits',
                (node) => node.removalSlots,
            ),
            replicationSlotsUsed: createRangePredicate(
                setupFilters.resources.replicationSlotsUsed,
                'usage',
                (node) => node.replicationSlots,
            ),
            replicationSlotsTotal: createRangePredicate(
                setupFilters.resources.replicationSlotsTotal,
                'limits',
                (node) => node.replicationSlots,
            ),

            // filter by tablets
            all: createRangePredicate(
                setupFilters.tablets.all,
                'all',
                (node) => node.tabletSlots,
                true,
            ),
            none: createRangePredicate(
                setupFilters.tablets.none,
                'none',
                (node) => node.tabletSlots.byState,
                true,
            ),
            leading: createRangePredicate(
                setupFilters.tablets.leading,
                'leading',
                (node) => node.tabletSlots.byState,
                true,
            ),
            following: createRangePredicate(
                setupFilters.tablets.following,
                'following',
                (node) => node.tabletSlots.byState,
                true,
            ),
            followerRecovery: createRangePredicate(
                setupFilters.tablets.followerRecovery,
                'follower_recovery',
                (node) => node.tabletSlots.byState,
                true,
            ),
            leaderRecovery: createRangePredicate(
                setupFilters.tablets.leaderRecovery,
                'leader_recovery',
                (node) => node.tabletSlots.byState,
                true,
            ),
            stopped: createRangePredicate(
                setupFilters.tablets.stopped,
                'stopped',
                (node) => node.tabletSlots.byState,
                true,
            ),
            elections: createRangePredicate(
                setupFilters.tablets.elections,
                'elections',
                (node) => node.tabletSlots.byState,
                true,
            ),

            staticUsed: createRangePredicate(
                setupFilters.tablets.staticUsed,
                'used',
                (node) => node.tabletStaticMemory,
            ),
            staticTotal: createRangePredicate(
                setupFilters.tablets.staticTotal,
                'limit',
                (node) => node.tabletStaticMemory,
            ),
            dynamicUsed: createRangePredicate(
                setupFilters.tablets.dynamicUsed,
                'used',
                (node) => node.tabletDynamicMemory,
            ),
            dynamicTotal: createRangePredicate(
                setupFilters.tablets.dynamicTotal,
                'limit',
                (node) => node.tabletDynamicMemory,
            ),
        };
        return predicates;
    },
);

export const getComponentNodesFilterPredicates = createSelector(
    [getFilterPredicatesObject],
    (filterPredicatesObject) => {
        return _.filter(filterPredicatesObject, (p) => p) as Array<(node: Node) => boolean>;
    },
);

export const getPropertiesRequiredForFilters = createSelector(
    [getFilterPredicatesObject],
    (filterPredicatesObject) => {
        const picked = _.values(
            _.pickBy(
                PropertiesByPredicate,
                (_value, key) => filterPredicatesObject[key as keyof typeof PropertiesByPredicate],
            ),
        ) as any;

        return _.union(...picked) as Array<ValueOf<typeof PropertiesByPredicate>[number]>;
    },
);

function createNodeTagPredicate(
    tagFilter: string | TagFilter,
    nodesByTags: Record<string, Set<Pick<Node, 'tags'>>>,
): undefined | ((node: Pick<Node, 'tags'>) => boolean) {
    if (!tagFilter) {
        return undefined;
    }

    if (typeof tagFilter === 'string') {
        return (node) => {
            return _.some(
                node.tags,
                (item) => -1 !== item.toLowerCase().indexOf(tagFilter.toLowerCase()),
            );
        };
    }

    const {mode, useRegexp, filter, selected} = tagFilter;

    const selectedItems = selected || [];

    switch (mode) {
        case 'union': {
            if (!selected?.length) {
                return undefined;
            }
            return (node) => {
                return _.some(selectedItems, (tagName) => {
                    return nodesByTags[tagName]?.has(node);
                });
            };
        }
        case 'intersection': {
            if (!selected?.length) {
                return undefined;
            }
            return (node) => {
                return _.every(selectedItems, (tagName) => {
                    return nodesByTags[tagName]?.has(node);
                });
            };
        }
        case 'filter':
        case undefined: {
            if (!filter) {
                return undefined;
            }
            if (!useRegexp) {
                return createNodeTagPredicate(filter, {});
            }
            try {
                const re = new RegExp(filter);
                return (node) => {
                    return _.some(node.tags, (tag) => re.test(tag));
                };
            } catch (e) {
                return () => false;
            }
        }
    }
}

function createFlagPredicate<T extends keyof typeof PropertiesByPredicate>(
    key: (typeof PropertiesByPredicate)[T][number],
    flag: FlagState,
) {
    if (!flag || flag === 'all') {
        return undefined;
    }

    return (node: NodeWithProps<T>) => {
        return flag === 'disabled' ? !node[key] : Boolean(node[key]);
    };
}

function createAttributeStatePredicate<T extends keyof typeof PropertiesByPredicate>(
    key: (typeof PropertiesByPredicate)[T][number],
    value: FlagState,
) {
    if (value === 'all') {
        return undefined;
    }

    return (node: NodeWithProps<T>) => {
        return value === 'disabled' ? Boolean(node[key]) : !node[key];
    };
}

function createAlertsFlagPredicate(flag: FlagState) {
    if (!flag || flag === 'all') {
        return undefined;
    }

    return (node: Pick<Node, 'alertCount'>) => {
        if (flag === 'disabled') {
            return node.alertCount === 0;
        }

        return node.alertCount! > 0;
    };
}

function createRangePredicate<T extends keyof typeof PropertiesByPredicate, U>(
    range: NodeRange,
    key: keyof U,
    get: (node: NodeWithProps<T>) => U,
    asArray?: boolean,
) {
    if (!isRangeFilterDefined(range)) {
        return undefined;
    }

    const {from, to} = range;

    return (node: NodeWithProps<T>) => {
        const value: any = get(node)[key];

        const nodeValue = asArray ? value.length : value;

        return (
            nodeValue >= (from.value === null ? -Infinity : from.value) &&
            nodeValue <= (to.value === null ? Infinity : to.value)
        );
    };
}

export function isRangeFilterDefined({from, to}: NodeRange) {
    return from.value !== null || to.value !== null;
}
