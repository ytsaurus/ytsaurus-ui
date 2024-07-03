import {NavigationTableSchema} from '../../module/queryNavigation/queryNavigationSlice';
import {loadTableAttributes} from '../api/loadTableAttributes';
import ypath from '../../../../common/thor/ypath';
import {QueryEngine} from '../../module/engines';
import {makePathByQueryEngine} from './makePathByQueryEngine';
import {ClusterConfig} from '../../../../../shared/yt-types';

type Props = (data: {
    clusterConfig: ClusterConfig;
    path: string;
    engine: QueryEngine;
    limit: number;
}) => Promise<string>;

export const createTableSelect: Props = async ({clusterConfig, path, engine, limit}) => {
    const attributes = await loadTableAttributes(path, clusterConfig);
    const schema: NavigationTableSchema[] = ypath.getValue(attributes.schema);

    return `SELECT
${schema.map((i) => '    `' + i.name + '`').join(',\r\n')}
FROM ${makePathByQueryEngine({path, cluster: clusterConfig.id, engine})}
LIMIT ${limit}`;
};
