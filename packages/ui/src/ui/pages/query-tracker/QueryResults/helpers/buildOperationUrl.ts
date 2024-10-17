export const buildOperationUrl = (cluster: string, operation: string, tag?: string) => {
    let uri = '';

    if (tag === undefined) {
        uri = `/operations/${encodeURIComponent(operation)}`;
    } else if (tag === 'filter') {
        uri = `/operations?type=all&state=all&filter=${encodeURIComponent(operation)}`;
    }

    return `/${cluster.split('.')[0]}${uri}`;
};
