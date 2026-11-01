const ACCOUNT_TREE_PREFIX = '//sys/account_tree/';

export function accountPathToTopLevel(path: string) {
    if (!path.startsWith(ACCOUNT_TREE_PREFIX)) {
        return undefined;
    }

    return path.slice(ACCOUNT_TREE_PREFIX.length).split('/')[0] || undefined;
}
