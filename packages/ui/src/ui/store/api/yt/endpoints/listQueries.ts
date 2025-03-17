import {ApiMethodParams, YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';

export type QueriesListRequestParams = {
    limit?: number;
    output_format?: string;
    is_tutorial?: string;
    user?: string;
    engine?: string;
    filter?: string;
    state?: string;
};

type ListQueriesArgs = ApiMethodParams<QueriesListRequestParams> & {
    stage?: string;
};

export async function listQueries(args: ListQueriesArgs) {
    try {
        const response = ytApiV4Id.listQueries(YTApiId.listQueries, args);
        return {data: response};
    } catch (error) {
        return {error};
    }
}
