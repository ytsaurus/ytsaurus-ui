import {type YTApiIdType} from '../../../../../../shared/constants/yt-api-id';
import ypath from '../../../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareHeaders,
    prepareRows,
} from '../../../../../utils/navigation/content/table/table';
import {
    type ReadTableParameters,
    type ReadTableResult,
    tableReadParameters,
    tableReadSetup,
} from './readTable';

type ReadStaticTableParameters = ReadTableParameters<{path: string}> & {id?: YTApiIdType};

export async function readStaticTable({
    id = YTApiId.tableRead,
    setup,
    parameters,
    cancellation,
    reverseRows,
}: ReadStaticTableParameters): Promise<ReadTableResult> {
    const tmp = await ytApiV3Id.readTable(id, {
        setup: {...setup, ...tableReadSetup},
        parameters: {
            ...parameters,
            ...tableReadParameters,
            ...{table_reader: {workload_descriptor: {category: 'user_interactive'}}},
        },
        cancellation,
    });

    const {data, headers} = tmp as any;

    const error = parseErrorFromResponse(data);
    if (error) return Promise.reject(getParsedError(error));

    const {columns, rows, yqlTypes} = prepareRows(data, reverseRows);
    const omittedColumns = prepareHeaders(headers);

    const value_format = ypath.getValue(parameters.output_format, '/@value_format');

    return {
        columns,
        omittedColumns,
        rows,
        yqlTypes,
        useYqlTypes: value_format === 'yql',
    };
}
