import {YT} from '../../config/yt-config';
import {getClusterProxy} from '../../store/selectors/global';
import {YTApiId, ytApiV3, ytApiV3Id} from '../../rum/rum-wrap-api';
import {JSONSerializer} from '../../common/yt-api';
import ypath from '../../common/thor/ypath';
import {isFolderNode} from '../navigation/isFolderNode';
import {isTableNode} from '../navigation/isTableNode';
import type {BatchSubRequest} from '../../../shared/yt-types';

export type CatalogCancellation = {readonly isCancellationRequested: boolean};
export type QueryCatalogNode = {name: string; path: string; kind: 'table' | 'directory'};
export type QueryCatalogColumn = {name: string; type?: string};
export type QueryCatalogLocation = {clusterId: string; path: string};

function getSetup(clusterId: string) {
    const cluster = YT.clusters[clusterId];
    return cluster ? {proxy: getClusterProxy(cluster), JSONSerializer} : undefined;
}

export async function listQueryCatalogChildren(
    {clusterId, path}: QueryCatalogLocation,
    token?: CatalogCancellation,
): Promise<QueryCatalogNode[]> {
    const setup = getSetup(clusterId);
    if (!setup || token?.isCancellationRequested || (path && !path.startsWith('/'))) return [];
    const parent = path.replace(/\/+$/, '') || '/';
    const nodes = await ytApiV3Id.list(YTApiId.navigationListNodes, {
        setup,
        parameters: {path: parent, attributes: ['type', 'broken']},
    });
    if (token?.isCancellationRequested) return [];
    return ypath.getValue(nodes).flatMap((node: unknown) => {
        const name = ypath.getValue(node) as string;
        const {type, broken} = ypath.getAttributes(node);
        if (broken || (!isFolderNode(type) && !isTableNode(type))) return [];
        return [{name, path: parent + '/' + name, kind: isTableNode(type) ? 'table' : 'directory'}];
    });
}

export async function resolveQueryCatalogDirectory(
    {clusterId, path}: QueryCatalogLocation,
    token?: CatalogCancellation,
): Promise<string | undefined> {
    const setup = getSetup(clusterId);
    if (!setup || token?.isCancellationRequested) return undefined;
    let parent = path.replace(/\/+$/, '') || '/';
    if (await ytApiV3.exists({setup, parameters: {path: parent}})) return parent;
    if (token?.isCancellationRequested || /[^/]\/$/.test(path)) return undefined;
    parent = parent.split('/').slice(0, -1).join('/') || '/';
    return (await ytApiV3.exists({setup, parameters: {path: parent}})) ? parent : undefined;
}

export async function getQueryCatalogSchemas(
    locations: QueryCatalogLocation[],
    token?: CatalogCancellation,
): Promise<{path: string; columns: QueryCatalogColumn[]}[]> {
    if (token?.isCancellationRequested) return [];
    const requests: BatchSubRequest[] = [];
    const paths: string[] = [];
    for (const {clusterId, path} of locations) {
        const setup = getSetup(clusterId);
        if (!setup || !path.startsWith('//')) continue;
        paths.push(path);
        requests.push({command: 'get', parameters: {path: path + '/@schema'}, setup});
    }
    if (!requests.length) return [];
    const responses = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
        parameters: {requests},
    });
    if (token?.isCancellationRequested) return [];
    return responses.flatMap((response, index) =>
        response.output
            ? [
                  {
                      path: paths[index],
                      columns: ypath.getValue(response.output) as QueryCatalogColumn[],
                  },
              ]
            : [],
    );
}
