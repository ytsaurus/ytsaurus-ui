import {NavigationTableSchema} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {loadTableAttributes} from '../api/loadTableAttributes';
import ypath from '../../../../common/thor/ypath';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {makePathByQueryEngine} from './makePathByQueryEngine';
import {ClusterConfig} from '../../../../../shared/yt-types';

type Props = {
    clusterConfig: ClusterConfig;
    path: string;
    engine: QueryEngine;
    limit: number;
};

export const createTablePrompt = ({
    schema,
    path,
    engine,
    limit,
    cluster,
}: Omit<Props, 'clusterConfig'> & {cluster: string; schema: {name: string}[]}) => {
    return `SELECT
${schema.map((i) => '    `' + i.name + '`').join(',\r\n')}
FROM ${makePathByQueryEngine({path, cluster: cluster, engine})}
LIMIT ${limit}`;
};

export const createTableSelect = async ({clusterConfig, path, engine, limit}: Props) => {
    const attributes = await loadTableAttributes(path, clusterConfig);
    const schema: NavigationTableSchema[] = ypath.getValue(attributes.schema);

    return createTablePrompt({schema, path, engine, limit, cluster: clusterConfig.id});
};
