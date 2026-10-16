import {collectAccountResourceUsagePaths} from './account-delete';

describe('collectAccountResourceUsagePaths', () => {
    it('returns only resource paths with non-zero recursive usage', () => {
        const account = {
            $attributes: {
                recursive_resource_usage: {
                    node_count: 3,
                    chunk_count: 0,
                    disk_space_per_medium: {default: 10, cache: 0},
                },
            },
        };

        expect(collectAccountResourceUsagePaths(account)).toEqual([
            'node_count',
            'disk_space_per_medium/default',
        ]);
    });

    it('returns an empty list when resource usage is absent', () => {
        expect(collectAccountResourceUsagePaths({$attributes: {}})).toEqual([]);
    });
});
