import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../../shared/constants/settings';
import {QueryEngine} from '../../../../shared/constants/engines';

export function createQueryUrl(
    cluster: string,
    query_id: string,
    settings?: {withSearch?: boolean},
) {
    const baseUrl = `/${cluster}/${Page.QUERIES}${query_id ? `/${query_id}` : ''}`;
    return settings?.withSearch ? `${baseUrl}${window.location.search}` : baseUrl;
}

export function createNewQueryUrl(
    QTcluster: string,
    engine: QueryEngine,
    {tableCluster, path, useDraft}: {tableCluster?: string; path?: string; useDraft?: boolean},
) {
    return makeRoutedURL(`/${QTcluster}/${Page.QUERIES}?`, {
        engine,
        path: path || undefined,
        cluster: tableCluster || QTcluster,
        useDraft: useDraft || undefined,
    });
}
