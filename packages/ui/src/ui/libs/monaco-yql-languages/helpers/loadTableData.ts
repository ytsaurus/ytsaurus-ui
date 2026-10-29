import {getClustersAndPaths} from './getClusterAndPath';
import type {QueryEngine} from '../../../../shared/constants/engines';
import {
    type CatalogCancellation,
    getQueryCatalogSchemas,
} from '../../../utils/query-tracker/queryCatalog';

export const loadTableData = async (
    query: string,
    engine: QueryEngine,
    token?: CatalogCancellation,
) => {
    const tablePaths = getClustersAndPaths(query, engine);
    const useClusterMatch = [...query.matchAll(/(USE|use)\s([^;]+)/g)][0];
    const useClusterName = useClusterMatch?.[2].replace(/[^\w]/g, '') || null;
    const locations = tablePaths.flatMap(({cluster, path}) => {
        const clusterId = cluster || useClusterName;
        return path && clusterId ? [{clusterId, path}] : [];
    });
    const schemas = await getQueryCatalogSchemas(locations, token);
    return Object.fromEntries(
        schemas.map(({path, columns}) => [path, columns.map(({name}) => name)]),
    );
};
