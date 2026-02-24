import {AxiosProgressEvent, CancelTokenSource} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {
    BatchResultsItem,
    BatchSubRequest,
    GetParams,
    ListJobsParameters,
    ListJobsResponse,
    OutputFormat,
    PathParams,
    ReadTableParameters,
} from '../types/yt-types';

interface YTApiV3 {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<boolean>;
    alterQuery(
        ...args: ApiMethodParameters<{
            stage?: string;
            query_id: string;
            access_control_object?: string;
            annotations?: {
                title?: string;
            };
        }>
    ): Promise<any>;
    listJobs(...args: ApiMethodParameters<ListJobsParameters>): Promise<ListJobsResponse>;
    readTable(...args: ApiMethodParameters<ReadTableParameters>): Promise<unknown>;
    [method: string]: (...args: ApiMethodParameters<any>) => Promise<any>;
}

export interface BatchParameters {
    requests: Array<BatchSubRequest>;
    output_format?: OutputFormat;
}

export type SaveCancellationCb = (cancel: CancelTokenSource) => void;

export type ApiMethodParameters<PrametersT = unknown> =
    | [ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters']]
    | [ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters'], unknown];

export type YTApiSetup = {
    proxy?: string;
    requestHeaders?: Record<string, string>;
    transformResponse?: (d: {parsedData: any; rawResponse: any}) => any;
    transformError?: (d: {parsedData: any; rawError: any}) => any;
    onUploadProgress?: (e: AxiosProgressEvent) => void;
    JSONSerializer?: {
        parse: (data: string) => any;
        stringify: (data: any) => string;
    };
};

export interface ApiMethodParams<ParametersT> {
    parameters: ParametersT;
    data?: any;
    setup?: YTApiSetup;
    cancellation?: SaveCancellationCb;
}

export const ytApiV3 = yt.v3 as YTApiV3;
