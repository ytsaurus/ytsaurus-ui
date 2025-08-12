import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {injectColumnsFromSchema} from '../../../../utils/navigation/content/table/table-ts';
import {NavigationTableSchema} from '../../module/queryNavigation/queryNavigationSlice';
import {UnipikaValue} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {JSONSerializer} from '../../../../common/yt-api';
import {TypeArray} from '../../../../components/SchemaDataType/dataTypes';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {readStaticTable} from '../../../../store/actions/navigation/content/table/readStaticTable';

type LoadStaticTableRows = (props: {
    path: string;
    clusterConfig: ClusterConfig;
    schema: NavigationTableSchema[];
    limit: number;
    output_format: Record<string, any> | string;
}) => Promise<{columns: string[]; rows: UnipikaValue[]; yqlTypes: TypeArray[] | null}>;

export const loadStaticTable: LoadStaticTableRows = async ({
    path,
    clusterConfig,
    schema,
    limit,
    output_format,
}) => {
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

    const {columns, omittedColumns, rows, yqlTypes} = await wrapApiPromiseByToaster(
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
        rows,
        yqlTypes,
    };
};
