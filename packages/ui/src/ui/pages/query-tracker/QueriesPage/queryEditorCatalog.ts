import type {QueryCatalogItem, QueryCatalogRequest, QueryTableColumn} from '@gravity-ui/querieskit';
import {
    getQueryCatalogSchemas,
    listQueryCatalogChildren,
} from '../../../utils/query-tracker/queryCatalog';

export async function listQueryPathChildren({
    clusterId,
    path,
    token,
}: QueryCatalogRequest): Promise<QueryCatalogItem[]> {
    if (!clusterId) return [];
    return listQueryCatalogChildren({clusterId, path}, token);
}

export async function getQueryTableSchema({
    clusterId,
    path,
    token,
}: QueryCatalogRequest): Promise<QueryTableColumn[]> {
    if (!clusterId) return [];
    const schemas = await getQueryCatalogSchemas(
        [{clusterId, path: path.replace(/^ytTable:/, '')}],
        token,
    );
    return schemas[0]?.columns.map(({name, type}) => ({name, type})) ?? [];
}
