import type {QueryCatalogItem, QueryCatalogRequest, QueryTableColumn} from '@gravity-ui/querieskit';
import {YT} from '../../../config/yt-config';
import {getClusterProxy} from '../../../store/selectors/global';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {JSONSerializer} from '../../../common/yt-api';
import ypath from '../../../common/thor/ypath';
import {isFolderNode} from '../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../utils/navigation/isTableNode';

export async function listQueryPathChildren({
    clusterId,
    path,
    token,
}: QueryCatalogRequest): Promise<QueryCatalogItem[]> {
    const cluster = clusterId && YT.clusters[clusterId];
    if (!cluster || token.isCancellationRequested) return [];
    // Database names are not Cypress paths; only request the YT catalog for paths.
    if (path && !path.startsWith('/')) return [];
    const parent = path.replace(/\/+$/, '') || '/';
    const nodes = await ytApiV3Id.list(YTApiId.navigationListNodes, {
        setup: {proxy: getClusterProxy(cluster), JSONSerializer},
        parameters: {path: parent, attributes: ['type', 'broken']},
    });
    if (token.isCancellationRequested) return [];
    return ypath.getValue(nodes).flatMap((node: unknown) => {
        const name = ypath.getValue(node) as string;
        const {type, broken} = ypath.getAttributes(node);
        if (broken || (!isFolderNode(type) && !isTableNode(type))) return [];
        return [
            {
                name,
                path: parent + '/' + name,
                kind: isTableNode(type) ? ('table' as const) : ('directory' as const),
            },
        ];
    });
}

export async function getQueryTableSchema({
    clusterId,
    path,
    token,
}: QueryCatalogRequest): Promise<QueryTableColumn[]> {
    const cluster = clusterId && YT.clusters[clusterId];
    const tablePath = path.replace(/^ytTable:/, '');
    if (!cluster || !tablePath.startsWith('//') || token.isCancellationRequested) return [];
    const schema = await ytApiV3Id.get(YTApiId.navigationGetPath, {
        setup: {proxy: getClusterProxy(cluster), JSONSerializer},
        parameters: {path: tablePath + '/@schema'},
    });
    if (token.isCancellationRequested) return [];
    return ypath
        .getValue(schema)
        .map(({name, type}: {name: string; type?: string}) => ({name, type}));
}
