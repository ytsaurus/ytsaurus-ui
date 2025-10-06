import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {injectColumnsFromSchema} from '../../../../utils/navigation/content/table/table-ts';
import {NavigationTableSchema} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {JSONSerializer} from '../../../../common/yt-api';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ClusterConfig, ReadTableOutputFormat} from '../../../../../shared/yt-types';
import {readStaticTable} from '../../../../store/actions/navigation/content/table/readStaticTable';
import {ReadTableResult} from '../../../../store/actions/navigation/content/table/readTable';

type LoadStaticTableParams = {
    path: string;
    clusterConfig: ClusterConfig;
    schema: NavigationTableSchema[];
    limit: number;
    output_format: ReadTableOutputFormat;
};

export async function loadStaticTable({
    path,
    clusterConfig,
    schema,
    limit,
    output_format,
}: LoadStaticTableParams): Promise<ReadTableResult> {
    const setup = {
        proxy: getClusterProxy(clusterConfig),
        JSONSerializer,
    };

    const parameters = {
        path: path + '[#' + 0 + ':#' + limit + ']',
        output_format,
        table_reader: {
            workload_descriptor: {category: 'user_interactive'},
        },
    };

    const {columns, omittedColumns, ...rest} = await wrapApiPromiseByToaster(
        readStaticTable({setup, parameters}),
        {
            skipSuccessToast: true,
            toasterName: 'query_navigation_node',
            errorTitle: 'Navigation node get rows failure',
        },
    );

    const schemaColumns = schema.map(({name}) => name);

    return {
        columns: injectColumnsFromSchema(columns, omittedColumns, schemaColumns),
        ...rest,
    };
}
