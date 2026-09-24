import {type FieldTree, fieldTreeForEach} from '../../common/hammer/field-tree';

interface AccountWithRecursiveUsage {
    $attributes: {
        recursive_resource_usage?: unknown;
    };
}

export function collectAccountResourceUsagePaths(account: AccountWithRecursiveUsage) {
    const result = new Set<string>();
    const resourceUsage = account.$attributes.recursive_resource_usage as
        FieldTree<number> | undefined;

    if (!resourceUsage) {
        return [];
    }

    fieldTreeForEach(
        resourceUsage,
        (value) => typeof value === 'number',
        (path, _tree, item) => {
            if (typeof item === 'number' && item > 0) {
                result.add(path.join('/'));
            }
        },
    );

    return [...result];
}
