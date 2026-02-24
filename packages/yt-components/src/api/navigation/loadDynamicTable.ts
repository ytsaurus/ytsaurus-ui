import {YTApiSetup, ytApiV3} from '../rum-wrap-api';
import unipika from '../../utils/unipika';
import Query from './query';
import {ReadTableOutputFormat} from '../../types/yt-types';
import {injectColumnsFromSchema} from './helpers/injectColumnsFromSchema';
import {NavigationTableSchema, ReadTableResult} from '../../types/navigation';
import {readDynamicTable} from './helpers/readDynamicTable';

export type LoadDynamicTableParams = {
    path: string;
    setup: YTApiSetup;
    schema: NavigationTableSchema[];
    login: string;
    keyColumns: string[];
    limit: number;
    outputFormat: ReadTableOutputFormat;
    /** When true, decode UTF-8 in column names. Pass from app settings (e.g. useUnipikaSettings().showDecoded). */
    showDecoded?: boolean;
};

type ColumnPermission = {
    action: string;
    object_id: string;
    object_name: string;
    subject_id: string;
    subject_name: string;
};

export async function loadDynamicTableRequest({
    setup,
    path,
    login,
    schema,
    keyColumns,
    limit,
    outputFormat,
    showDecoded = true,
}: LoadDynamicTableParams): Promise<ReadTableResult> {
    const allColumns = schema.map(({name}) => name);
    const permissions: {columns: ColumnPermission[]} = await ytApiV3.checkPermission({
        setup,
        parameters: {
            columns: allColumns,
            permission: 'read',
            user: login,
            path,
        },
    });

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

    const aColumns = availableColumns.map((col) => unipika.decode(col, showDecoded));
    const parameters = {
        query: Query.prepareQuery({
            aColumns,
            path,
            keyColumns,
            offset: 0,
            limit,
        }),
        output_format: outputFormat,
        dump_error_into_response: true,
    };

    const {columns, ...rest} = await readDynamicTable({setup, parameters});

    const schemaColumns = schema.map(({name}) => name);
    return {
        columns: injectColumnsFromSchema(columns, omittedColumns, schemaColumns),
        ...rest,
    };
}
