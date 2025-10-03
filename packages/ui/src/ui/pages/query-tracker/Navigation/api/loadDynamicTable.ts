import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import unipika from '../../../../common/thor/unipika';
import Query from '../../../../utils/navigation/content/table/query';
import {injectColumnsFromSchema} from '../../../../utils/navigation/content/table/table-ts';
import {NavigationTableSchema} from '../../../../store/reducers/queries/queryNavigationSlice';
import {JSONSerializer} from '../../../../common/yt-api';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ClusterConfig, ReadTableOutputFormat} from '../../../../../shared/yt-types';
import {readDynamicTable} from '../../../../store/actions/navigation/content/table/readDynamicTable';
import {ReadTableResult} from '../../../../store/actions/navigation/content/table/readTable';

type LoadDynamicTableParams = {
    path: string;
    clusterConfig: ClusterConfig;
    schema: NavigationTableSchema[];
    login: string;
    keyColumns: string[];
    limit: number;
    output_format: ReadTableOutputFormat;
};

type ColumnPermission = {
    action: string;
    object_id: string;
    object_name: string;
    subject_id: string;
    subject_name: string;
};

export async function loadDynamicTableRequest({
    clusterConfig,
    path,
    login,
    schema,
    keyColumns,
    limit,
    output_format,
}: LoadDynamicTableParams): Promise<ReadTableResult> {
    const allColumns = schema.map(({name}) => name);
    const permissions = await wrapApiPromiseByToaster<{columns: ColumnPermission[]}>(
        ytApiV3Id.checkPermission(YTApiId.dynTableCheckPerm, {
            setup: {
                proxy: getClusterProxy(clusterConfig),
                JSONSerializer,
            },
            parameters: {
                columns: allColumns,
                permission: 'read',
                user: login,
                path,
            },
        }),
        {
            skipSuccessToast: true,
            toasterName: 'query_navigation_node_permissions',
            errorTitle: 'Navigation node get attributes failure',
        },
    );

    if (!Array.isArray(permissions.columns)) {
        return Promise.reject(new Error('Dynamic table columns is not array'));
    }

    const {availableColumns, omittedColumns, deniedKeyColumns} = permissions.columns.reduce<{
        availableColumns: string[];
        omittedColumns: string[];
        deniedKeyColumns: Record<string, string>[];
    }>(
        (acc, permission, index) => {
            if (permission.action === 'allow') {
                acc.availableColumns.push(allColumns[index]);
            } else {
                acc.omittedColumns.push(allColumns[index]);
                if (keyColumns.includes(allColumns[index])) {
                    acc.deniedKeyColumns.push({[allColumns[index]]: permission.action});
                }
            }

            return acc;
        },
        {availableColumns: [], omittedColumns: [], deniedKeyColumns: []},
    );

    if (deniedKeyColumns.length !== 0) {
        return Promise.reject(new Error('Dynamic table has denied key columns'));
    }

    const aColumns = availableColumns.map(unipika.decode);
    const parameters = {
        query: Query.prepareQuery({
            aColumns,
            path,
            keyColumns,
            offset: 0,
            limit,
        }),
        output_format,
        dump_error_into_response: true,
    };

    const setup = {
        proxy: getClusterProxy(clusterConfig),
        JSONSerializer,
    };

    const {columns, ...rest} = await wrapApiPromiseByToaster(
        readDynamicTable({setup, parameters}),
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
