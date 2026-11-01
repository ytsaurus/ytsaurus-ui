export interface AccountTreeYsonNode {
    $attributes?: Record<string, unknown>;
    $value?: Record<string, AccountTreeYsonNode>;
}

export interface AccountTreeYsonListItem {
    $attributes: Record<string, unknown>;
    $value: string;
}

export function accountTreeYsonToList(
    topLevel: string,
    response: AccountTreeYsonNode,
): AccountTreeYsonListItem[] {
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
