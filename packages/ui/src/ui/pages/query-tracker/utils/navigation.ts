import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../../shared/constants/settings';
import {QueryEngine} from '../module/engines';

export function createQueryUrl(cluster: string, query_id: string) {
    return `/${cluster}/${Page.QUERIES}${query_id ? `/${query_id}` : ''}`;
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
