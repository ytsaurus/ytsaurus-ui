import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareRows,
} from '../../../../../utils/navigation/content/table/table';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';
import {tableReadParameters, tableReadSetup} from './readTable';

type LoadDynamicTableRequest = (props: {
    setup?: unknown;
    parameters: unknown;
    cancellation?: unknown;
    reverseRows?: boolean;
}) => Promise<{
    columns: string[];
    rows: UnipikaValue[];
    yqlTypes: TypeArray[] | null;
}>;

export const readDynamicTable: LoadDynamicTableRequest = async ({
    setup,
    parameters,
    cancellation,
    reverseRows,
}) => {
    const {data} = await ytApiV3Id.selectRows(YTApiId.dynTableSelectRowsPreload, {
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
    return {columns, rows, yqlTypes};
};
