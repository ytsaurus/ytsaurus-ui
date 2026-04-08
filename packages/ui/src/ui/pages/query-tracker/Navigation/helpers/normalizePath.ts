export function normalizePath(path: string) {
    const trimmedPath = path.trim();

    if (trimmedPath.match(/^\/*$/)) {
        return '/';
    }

    return trimmedPath.replace(/^\/*/, '//').replace(/\/+$/, '');
}
