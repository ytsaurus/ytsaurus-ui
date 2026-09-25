import {parseAccountData} from './accounts-selector';

function makeResources({nodeCount, diskSpace, masterMemory}: Record<string, number>) {
    return {
        node_count: nodeCount,
        chunk_count: nodeCount + 1,
        tablet_count: nodeCount + 2,
        tablet_static_memory: nodeCount + 3,
        disk_space_per_medium: {default: diskSpace},
        master_memory: {
            total: masterMemory,
            chunk_host: masterMemory + 1,
            per_cell: {cell_a: masterMemory + 2},
        },
        detailed_master_memory: {
            nodes: masterMemory + 3,
            chunks: masterMemory + 4,
            attributes: masterMemory + 5,
            tablets: masterMemory + 6,
            schemas: masterMemory + 7,
        },
    };
}

describe('parseAccountData', () => {
    it('parses regular, recursive, per-medium and per-cell resources', () => {
        const resourceUsage = makeResources({nodeCount: 20, diskSpace: 200, masterMemory: 2000});
        const committedResourceUsage = makeResources({
            nodeCount: 10,
            diskSpace: 100,
            masterMemory: 1000,
        });
        const resourceLimits = makeResources({
            nodeCount: 40,
            diskSpace: 400,
            masterMemory: 4000,
        });
        const recursiveResourceUsage = makeResources({
            nodeCount: 30,
            diskSpace: 300,
            masterMemory: 3000,
        });
        const recursiveCommittedResourceUsage = makeResources({
            nodeCount: 15,
            diskSpace: 150,
            masterMemory: 1500,
        });

        const result = parseAccountData({
            $value: 'account-a',
            $attributes: {
                abc: {id: 42, slug: 'service'},
                parent_name: 'parent',
                responsibles: ['user-a'],
                resource_usage: resourceUsage,
                committed_resource_usage: committedResourceUsage,
                resource_limits: resourceLimits,
                recursive_resource_usage: recursiveResourceUsage,
                recursive_committed_resource_usage: recursiveCommittedResourceUsage,
                recursive_violated_resource_limits: {
                    node_count: 1,
                    chunk_count: 2,
                    disk_space_per_medium: {default: 3},
                    master_memory: {total: 100},
                },
            },
        });

        expect(result).toMatchObject({
            $value: 'account-a',
            name: 'account-a',
            abc: {id: 42, slug: 'service'},
            parent: 'parent',
            responsibleUsers: ['user-a'],
            hasRecursiveResources: true,
            totalNodeCount: 20,
            committedNodeCount: 10,
            nodeCountLimit: 40,
            perMedium: {
                default: {
                    totalDiskSpace: 200,
                    committedDiskSpace: 100,
                    diskSpaceLimit: 400,
                },
            },
            master_memory_total: {
                total: 2000,
                committed: 1000,
                limit: 4000,
            },
            master_memory_per_cell_cell_a: {
                total: 2002,
                committed: 1002,
                limit: 4002,
            },
            master_memory_detailed: resourceUsage.detailed_master_memory,
            alertsCount: 6,
            recursiveResources: {
                totalNodeCount: 30,
                committedNodeCount: 15,
                nodeCountLimit: 40,
                perMedium: {
                    default: {
                        totalDiskSpace: 300,
                        committedDiskSpace: 150,
                        diskSpaceLimit: 400,
                    },
                },
                master_memory_total: {
                    total: 3000,
                    committed: 1500,
                    limit: 4000,
                },
            },
        });
        expect(result.responsibleUsersSet).toEqual(new Set(['user-a']));
    });

    it('uses empty resource values when metadata is absent', () => {
        const result = parseAccountData({
            $value: 'account-b',
            $attributes: {abc: {id: 1}, parent_name: 'parent'},
        });

        expect(result).toMatchObject({
            name: 'account-b',
            parent: 'parent',
            abc: {id: 1},
            hasRecursiveResources: false,
            totalNodeCount: 0,
            nodeCountLimit: 0,
            perMedium: {},
            recursiveResources: {},
            alertsCount: 0,
        });
    });
});
