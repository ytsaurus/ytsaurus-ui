import {getClusterAndPath} from './getClusterAndPath';
import {QueryEngine} from '../../../../shared/constants/engines';
import {YT} from '../../../config/yt-config';
import ypath from '../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getClusterProxy} from '../../../store/selectors/global';
import {JSONParser} from '../../../common/yt-api';
import {BatchSubRequest} from '../../../../shared/yt-types';

export const loadTableData = async (query: string, engine: QueryEngine) => {
    const tablePaths = query.match(/(\w+\.)*`(\/\/([^`]*))`/g); // get all table paths
    if (!tablePaths) return {};

    const useClusterMatch = [...query.matchAll(/(USE|use)\s([^;]+)/g)][0];
    const useClusterName = useClusterMatch?.[2].replace(/[^\w]/g, '') || null;

    const requests: BatchSubRequest[] = [];
    tablePaths.forEach((tablePath) => {
        const {path, cluster} = getClusterAndPath(tablePath, engine);
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
                ...JSONParser,
            },
        });
    });

    const tableSchemas = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
        parameters: {requests},
    });

    const res: Record<string, string[]> = {};
    tableSchemas.forEach((response, index) => {
        if (response.output) {
            const columns: {name: string}[] = ypath.getValue(response.output, '');
            res[tablePaths[index]] = columns.map(({name}) => name);
        }
    });

    return res;
};
