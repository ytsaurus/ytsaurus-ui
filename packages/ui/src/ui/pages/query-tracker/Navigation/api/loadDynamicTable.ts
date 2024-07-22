import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import unipika from '../../../../common/thor/unipika';
import Query from '../../../../utils/navigation/content/table/query';
import {injectColumnsFromSchema} from '../../../../utils/navigation/content/table/table-ts';
import {NavigationTableSchema} from '../../module/queryNavigation/queryNavigationSlice';
import {UnipikaValue} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {JSONParser} from '../../module/api';
import {TypeArray} from '../../../../components/SchemaDataType/dataTypes';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ClusterConfig} from '../../../../../shared/yt-types';
import {readDynamicTable} from '../../../../store/actions/navigation/content/table/readDynamicTable';

type LoadDynamicTable = (props: {
    path: string;
    clusterConfig: ClusterConfig;
    schema: NavigationTableSchema[];
    login: string;
    keyColumns: string[];
    limit: number;
    output_format: Record<string, any> | string;
}) => Promise<{columns: string[]; rows: UnipikaValue[]; yqlTypes: TypeArray[] | null}>;

type ColumnPermission = {
    action: string;
    object_id: string;
    object_name: string;
    subject_id: string;
    subject_name: string;
};

export const loadDynamicTableRequest: LoadDynamicTable = async ({
    clusterConfig,
    path,
    login,
    schema,
    keyColumns,
    limit,
    output_format,
}) => {
    const allColumns = schema.map(({name}) => name);
    const permissions = await wrapApiPromiseByToaster<{columns: ColumnPermission[]}>(
        ytApiV3Id.checkPermission(YTApiId.dynTableCheckPerm, {
            setup: {
                proxy: getClusterProxy(clusterConfig),
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
        return Promise.reject();
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
        return Promise.reject();
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
        transformResponse({
            parsedData,
            rawResponse,
        }: {
            parsedData: string;
            rawResponse: Record<string, string>;
        }) {
            return {
                data: parsedData,
                headers: rawResponse?.headers,
            };
        },
        ...JSONParser,
    };

    const {columns, rows, yqlTypes} = await wrapApiPromiseByToaster(
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
        rows,
        yqlTypes,
    };
};
