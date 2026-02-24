import {ytApiV3} from '../../rum-wrap-api';
import {getParsedError, parseErrorFromResponse, prepareRows} from '../table';
import {
    ReadTableParameters,
    ReadTableResult,
    tableReadParameters,
    tableReadSetup,
} from './readTable';

export async function readDynamicTable({
    setup,
    parameters,
    cancellation,
    reverseRows,
}: ReadTableParameters<{query: string}>): Promise<ReadTableResult> {
    const {data} = await ytApiV3.selectRows({
        setup: {
            ...(setup as object),
            ...tableReadSetup,
        },
        parameters: {...(parameters as object), ...tableReadParameters},
        cancellation,
    });

    const error = parseErrorFromResponse(data);
    if (error) return Promise.reject(getParsedError(error));

    const {columns, rows, yqlTypes} = prepareRows(data, reverseRows);

    const valueFormat = parameters.output_format.$attributes.value_format;

    return {
        columns,
        rows,
        yqlTypes,
        useYqlTypes: valueFormat === 'yql',
    };
}
