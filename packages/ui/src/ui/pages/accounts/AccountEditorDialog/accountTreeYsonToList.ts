export interface AccountTreeYsonNode {
    $attributes?: Record<string, unknown>;
    $value?: Record<string, AccountTreeYsonNode>;
}

export interface AccountTreeYsonListItem {
    $attributes: Record<string, unknown>;
    $value: string;
}

const ACCOUNT_TREE_PREFIX = '//sys/account_tree/';

export function accountPathToTopLevel(path?: string) {
    if (!path?.startsWith(ACCOUNT_TREE_PREFIX)) {
        return undefined;
    }

    return path.slice(ACCOUNT_TREE_PREFIX.length).split('/')[0] || undefined;
}

export function accountTreeYsonToList(
    topLevel: string,
    response?: AccountTreeYsonNode,
): AccountTreeYsonListItem[] {
    if (!response) {
        return [];
    }

    const result: AccountTreeYsonListItem[] = [];

    visitAccountTreeNode(topLevel, response, result);

    return result;
}

function visitAccountTreeNode(
    name: string,
    node: AccountTreeYsonNode,
    result: AccountTreeYsonListItem[],
) {
    result.push({$value: name, $attributes: node.$attributes || {}});

    Object.entries(node.$value || {}).forEach(([childName, child]) => {
        visitAccountTreeNode(childName, child, result);
    });
}
