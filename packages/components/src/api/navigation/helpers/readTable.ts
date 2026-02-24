import {ReadTableOutputFormat} from '../../../types';
import {SaveCancellationCb, YTApiSetup} from '../../rum-wrap-api';
import {TypeArray} from '../../../components/SchemaDataType';
import {UnipikaValue} from '../../../internal/Yson/StructuredYson/StructuredYsonTypes';

export const tableReadSetup = {
    /** Use the provided proxy directly; do not fetch heavy proxies from /hosts (matches UI behavior). */
    useHeavyProxy: false,
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
};

export const tableReadParameters = {
    dump_error_into_response: true,
    omit_inaccessible_columns: true,
};

export type ReadTableDataParameters = {path: string} | {query: string};

export type ReadTableParameters<DataParams extends ReadTableDataParameters> = {
    setup?: YTApiSetup;
    parameters: DataParams & {
        output_format: ReadTableOutputFormat;
    };
    cancellation?: SaveCancellationCb;
    reverseRows?: boolean;
};

export type ReadTableDataResult =
    | {
          useYqlTypes: true;
          rows: Array<Record<string, [UnipikaValue, `${number}`]>>;
      }
    | {
          useYqlTypes?: false;
          rows: Array<Record<string, UnipikaValue>>;
      };

export type ReadTableResult = ReadTableDataResult & {
    columns: string[];
    omittedColumns?: string[];
    yqlTypes: TypeArray[] | null;
};
