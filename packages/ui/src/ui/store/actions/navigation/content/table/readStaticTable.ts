import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareHeaders,
    prepareRows,
} from '../../../../../utils/navigation/content/table/table';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';

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
    const {data, headers} = await ytApiV3Id.readTable(YTApiId.tableRead, {
        setup,
        parameters,
        cancellation,
    });

    const error = parseErrorFromResponse(data);
    if (error) return Promise.reject(getParsedError(error));

    const {columns, rows, yqlTypes} = prepareRows(data, reverseRows);
    const omittedColumns = prepareHeaders(headers);

    return {columns, omittedColumns, rows, yqlTypes};
};
