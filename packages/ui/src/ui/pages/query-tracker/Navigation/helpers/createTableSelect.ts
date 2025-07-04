import {NavigationTableSchema} from '../../module/queryNavigation/queryNavigationSlice';
import {loadTableAttributes} from '../api/loadTableAttributes';
import ypath from '../../../../common/thor/ypath';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {makePathByQueryEngine} from './makePathByQueryEngine';
import {ClusterConfig} from '../../../../../shared/yt-types';
import unipika from '../../../../common/thor/unipika';

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
${schema.map((i) => '    ' + unipika.prettyprint(i.name, {asHTML: false}).replaceAll('"', '`')).join(',\r\n')}
FROM ${makePathByQueryEngine({path, cluster: cluster, engine})}
LIMIT ${limit}`;
};

export const createTableSelect = async ({clusterConfig, path, engine, limit}: Props) => {
    const attributes = await loadTableAttributes(path, clusterConfig);
    const schema: NavigationTableSchema[] = ypath.getValue(attributes.schema);

    return createTablePrompt({schema, path, engine, limit, cluster: clusterConfig.id});
};
