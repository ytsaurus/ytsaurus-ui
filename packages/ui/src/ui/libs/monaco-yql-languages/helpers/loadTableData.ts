import {getClustersAndPaths} from './getClusterAndPath';
import {QueryEngine} from '../../../../shared/constants/engines';
import {YT} from '../../../config/yt-config';
import ypath from '../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getClusterProxy} from '../../../store/selectors/global';
import {JSONSerializer} from '../../../common/yt-api';
import {BatchSubRequest} from '../../../../shared/yt-types';

export const loadTableData = async (query: string, engine: QueryEngine) => {
    const tablePaths = getClustersAndPaths(query, engine);

    const useClusterMatch = [...query.matchAll(/(USE|use)\s([^;]+)/g)][0];
    const useClusterName = useClusterMatch?.[2].replace(/[^\w]/g, '') || null;

    const requests: BatchSubRequest[] = [];
    tablePaths.forEach(({cluster, path}) => {
        const pathCluster = cluster || useClusterName;
        if (!path || !pathCluster) return;

        const clusterConfig = YT.clusters[pathCluster];
        if (!clusterConfig) return;

        requests.push({
            command: 'get' as const,
            parameters: {
                path: `${path}/@schema`,
            },
            setup: {
                proxy: getClusterProxy(clusterConfig),
                JSONSerializer,
            },
        });
    });

    const tableSchemas = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
        parameters: {requests},
    });

    const res: Record<string, string[]> = {};
    tableSchemas.forEach((response, index) => {
        const path = requests[index].parameters.path.replace('/@schema', '');
        if (response.output && path) {
            const columns: {name: string}[] = ypath.getValue(response.output, '');
            res[path] = columns.map(({name}) => name);
        }
    });

    return res;
};
