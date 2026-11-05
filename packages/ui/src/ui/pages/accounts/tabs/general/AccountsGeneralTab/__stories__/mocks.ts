import {type AccountTreeYsonNode} from '../../../../../../utils/accounts/accountTreeYsonToList';

export function makeAccount(name: string, parent = 'root', nodeCount = 7, abcSlug?: string) {
    return {
        $value: name,
        $attributes: {
            parent_name: parent,
            abc: abcSlug ? {id: 1, slug: abcSlug} : undefined,
            resource_usage: {node_count: nodeCount},
            recursive_resource_usage: {node_count: nodeCount},
            resource_limits: {node_count: 100},
        },
    };
}

export const defaultAccounts = [
    makeAccount('parent', 'root', 90),
    makeAccount('child', 'parent', 11),
    makeAccount('usable-only', 'parent', 22),
    makeAccount('hidden', 'parent', 57),
];
export const defaultUsable = ['child', 'usable-only'];
export const emptyTotals = {
    total_resource_usage: {disk_space_per_medium: {}},
    total_resource_limits: {disk_space_per_medium: {}},
};

export function accountList(accounts: typeof defaultAccounts) {
    return accounts.map(({$value, $attributes: {parent_name, abc}}) => ({
        $value,
        $attributes: {parent_name, abc},
    }));
}

export function accountBatch(accounts: typeof defaultAccounts) {
    return accounts.map((account) => ({
        output: {
            ...account,
            $value: {},
            $attributes: {...account.$attributes, name: account.$value},
        },
    }));
}

export function accountTree(accounts: typeof defaultAccounts, name: string): AccountTreeYsonNode {
    const account = accounts.find((item) => item.$value === name);
    if (!account) {
        throw new Error(`Missing account fixture: ${name}`);
    }
    return {
        $attributes: account.$attributes,
        $value: Object.fromEntries(
            accounts
                .filter((item) => item.$attributes.parent_name === name)
                .map((item) => [item.$value, accountTree(accounts, item.$value)]),
        ),
    };
}
