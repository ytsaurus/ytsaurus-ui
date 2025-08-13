import {ReadTableOutputFormat} from '../../../../../../shared/yt-types';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';
import {UnipikaValue} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {SaveCancellationCb, YTApiSetup} from '../../../../../rum/rum-wrap-api';

export const tableReadSetup = {
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
