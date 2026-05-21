import {createQueryUrl} from '../../utils/navigation';

export function buildQueryItemUrl(
    cluster: string,
    queryId: string,
    listMode: string,
    locationSearch: string,
): string {
    const url = createQueryUrl(cluster, queryId);
    const searchParams = new URLSearchParams(locationSearch);
    searchParams.set('listMode', listMode);
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}${searchParams.toString()}`;
}
