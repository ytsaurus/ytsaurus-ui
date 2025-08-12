import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareHeaders,
    prepareRows,
} from '../../../../../utils/navigation/content/table/table';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';
import {tableReadParameters, tableReadSetup} from './readTable';

type LoadStaticTableRows = (props: {
    setup: unknown;
    parameters: unknown;
    cancellation?: unknown;
    reverseRows?: boolean;
}) => Promise<{
    columns: string[];
    rows: UnipikaValue[];
    omittedColumns: string[];
    yqlTypes: TypeArray[] | null;
}>;

export const readStaticTable: LoadStaticTableRows = async ({
    setup,
    parameters,
    cancellation,
    reverseRows,
}) => {
    const tmp = await ytApiV3Id.readTable(YTApiId.tableRead, {
        setup: {...(setup as object), ...tableReadSetup},
        parameters: {...(parameters as object), ...tableReadParameters},
        cancellation,
    });

    const {data, headers} = tmp;

    const error = parseErrorFromResponse(data);
    if (error) return Promise.reject(getParsedError(error));

    const {columns, rows, yqlTypes} = prepareRows(data, reverseRows);
    const omittedColumns = prepareHeaders(headers);

    return {columns, omittedColumns, rows, yqlTypes};
};
