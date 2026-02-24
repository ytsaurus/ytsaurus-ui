import {injectColumnsFromSchema} from './helpers/injectColumnsFromSchema';
import {NavigationTableSchema, ReadTableResult} from '../../types/navigation';
import {ReadTableOutputFormat} from '../../types/yt-types';
import {YTApiSetup} from '../rum-wrap-api';
import {readStaticTable} from './helpers/readStaticTable';

type LoadStaticTableParams = {
    path: string;
    setup: YTApiSetup;
    schema: NavigationTableSchema[];
    limit: number;
    outputFormat: ReadTableOutputFormat;
};

export async function loadStaticTable({
    path,
    setup,
    schema,
    limit,
    outputFormat,
}: LoadStaticTableParams): Promise<ReadTableResult> {
    const parameters = {
        path: path + '[#' + 0 + ':#' + limit + ']',
        output_format: outputFormat,
        table_reader: {
            workload_descriptor: {category: 'user_interactive'},
        },
    };

    const {columns, omittedColumns, ...rest} = await readStaticTable({setup, parameters});

    const schemaColumns = schema.map(({name}) => name);

    return {
        columns: injectColumnsFromSchema(columns, omittedColumns, schemaColumns),
        ...rest,
    };
}
