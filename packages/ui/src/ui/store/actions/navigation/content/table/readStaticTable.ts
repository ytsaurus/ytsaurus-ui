import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareHeaders,
    prepareRows,
} from '../../../../../utils/navigation/content/table/table';
import {
    ReadTableParameters,
    ReadTableResult,
    tableReadParameters,
    tableReadSetup,
} from './readTable';

export async function readStaticTable({
    setup,
    parameters,
    cancellation,
    reverseRows,
}: ReadTableParameters<{path: string}>): Promise<ReadTableResult> {
    const tmp = await ytApiV3.readTable({
        setup: {...setup, ...tableReadSetup},
        parameters: {...parameters, ...tableReadParameters},
        cancellation,
    });

    const {data, headers} = tmp as any;

    const error = parseErrorFromResponse(data);
    if (error) return Promise.reject(getParsedError(error));

    const {columns, rows, yqlTypes} = prepareRows(data, reverseRows);
    const omittedColumns = prepareHeaders(headers);

    const value_format = parameters.output_format.$attributes.value_format;

    return {
        columns,
        omittedColumns,
        rows,
        yqlTypes,
        useYqlTypes: value_format === 'yql',
    };
}
