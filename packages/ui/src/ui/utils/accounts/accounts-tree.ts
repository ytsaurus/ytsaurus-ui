import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {type TreeNode, prepareTree} from '../../common/hammer/tree-list';

interface AccountTreeSource {
    name: string;
    parent?: string;
}

export type AccountTreeNode<T extends AccountTreeSource> = TreeNode<T, T>;

export function isTopLevelAccount(account?: AccountTreeSource) {
    return !account?.parent || account.parent === ROOT_ACCOUNT_NAME;
}

export function prepareAccountsTree<T extends AccountTreeSource>(
    accountsByName: Record<string, T>,
): Record<string, AccountTreeNode<T>> {
    return prepareTree(accountsByName, (account) => {
        if (!account.parent || accountsByName[account.parent] === undefined) {
            // A child of a missing account is attached to the common root.
            return '<Root>';
        }

        return account.parent;
    });
}

export function getAccountQuotaSources<T extends AccountTreeSource>(
    account: string,
    tree: Record<string, AccountTreeNode<T>>,
): Array<string> {
    return collectSubtreeItems(account, tree).sort();
}

export function getAccountSubtreeNames<T extends AccountTreeSource>(
    account: string,
    tree: Record<string, AccountTreeNode<T>>,
): Array<string> {
    const result: Array<string> = [];
    const visited = new Set<string>();

    function visit(name: string) {
        if (visited.has(name)) {
            return;
        }

        visited.add(name);
        result.push(name);
        tree[name]?.children.forEach((child) => visit(child.name));
    }

    if (tree[account]) {
        visit(account);
    }

    return result;
}

function collectSubtreeItems<T extends AccountTreeSource>(
    account: string,
    tree: Record<string, AccountTreeNode<T>>,
    collected = new Set<string>(),
): Array<string> {
    if (collected.has(account)) {
        return [];
    }

    collected.add(account);

    const result: Array<string> = [];
    const {parent, children, attributes} = tree[account] || {};
    const isTopLevel = isTopLevelAccount(attributes);

    if (parent && tree[parent] && !isTopLevel && !collected.has(parent as string)) {
        result.push(parent as string);
        result.push(...collectSubtreeItems(parent as string, tree, collected));
    }

    children?.forEach((item) => {
        if (!collected.has(item.name)) {
            result.push(item.name);
            result.push(...collectSubtreeItems(item.name, tree, collected));
        }
    });

    return result;
}
