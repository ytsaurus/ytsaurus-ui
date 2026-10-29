import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {type AccountTreeNode} from './accounts-tree';

interface AccountParent {
    name: string;
    parent?: string;
}

export function getAccountNamesWithParents(
    accounts: AccountParent[],
    selectedNames: Iterable<string>,
): Set<string> {
    const parents = new Map(accounts.map(({name, parent}) => [name, parent]));
    const result = new Set<string>();

    for (const selectedName of selectedNames) {
        let name: string | undefined = selectedName;
        while (name && name !== ROOT_ACCOUNT_NAME && !result.has(name)) {
            result.add(name);
            name = parents.get(name);
        }
    }

    return result;
}

export function filterAccountBranches<T extends AccountParent>(
    tree: AccountTreeNode<T>,
    names: Set<string> | undefined,
): AccountTreeNode<T> {
    if (!names) return tree;

    return {
        ...tree,
        children: tree.children
            .filter(({name}) => names.has(name))
            .map((child) => filterAccountBranches(child, names)),
    };
}
