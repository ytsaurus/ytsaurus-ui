import {makeRoutedURL} from '../../../store/location';
import {Page} from '../../../../shared/constants/settings';
import {QueryEngine} from '../module/api';

export function createQueryUrl(cluster: string, query_id: string) {
    return `/${cluster}/${Page.QUERIES}/${query_id}`;
}

export function createNewQueryUrl(
    QTcluster: string,
    engine: QueryEngine,
    {tableCluster, path}: {tableCluster?: string; path?: string},
) {
    return makeRoutedURL(`/${QTcluster}/${Page.QUERIES}?`, {
        engine,
        path: path || undefined,
        cluster: tableCluster || QTcluster,
    });
}
