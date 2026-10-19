import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';
import {type TreeNode, prepareTree} from '../../common/hammer/tree-list';

interface AccountTreeSource {
    name: string;
    parent?: string;
}

export type AccountTreeNode<T extends AccountTreeSource> = TreeNode<T, T>;

export function isTopLevelAccount(account: AccountTreeSource) {
    return !account.parent || account.parent === ROOT_ACCOUNT_NAME;
}

export function prepareAccountsTree<T extends AccountTreeSource>(
    accountsByName: Record<string, T>,
): Record<string, AccountTreeNode<T>> {
    return prepareTree(accountsByName, (account) => {
        if (!account.parent || !accountsByName[account.parent]) {
            // A child of a missing account is attached to the common root.
            return '<Root>';
        }

        return account.parent;
    });
}

export function getAccountQuotaSources<T extends AccountTreeSource>(
    accountName: string,
    tree: Record<string, AccountTreeNode<T>>,
): Array<string> {
    return collectSubtreeItems(accountName, tree).sort();
}

function collectSubtreeItems<T extends AccountTreeSource>(
    accountName: string,
    tree: Record<string, AccountTreeNode<T>>,
    collected = new Set<string>(),
): Array<string> {
    if (collected.has(accountName) || !tree[accountName]) {
        return [];
    }

    collected.add(accountName);

    const result: Array<string> = [];
    const {parent, children, attributes} = tree[accountName];
    const isTopLevel = isTopLevelAccount(attributes);

    if (parent && tree[parent] && !isTopLevel && !collected.has(parent)) {
        result.push(parent);
        result.push(...collectSubtreeItems(parent, tree, collected));
    }

    children?.forEach((item) => {
        if (!collected.has(item.name)) {
            result.push(item.name);
            result.push(...collectSubtreeItems(item.name, tree, collected));
        }
    });

    return result;
}
