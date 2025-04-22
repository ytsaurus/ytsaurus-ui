import {ApiMethodParams, BatchParameters, YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {BatchResultsItem} from '../../../../../shared/yt-types';
import {WrapApiOptions, getBatchError, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTError} from '../../../../types';

export type BatchApiArgs = {
    id: YTApiId;
    toaster?: WrapApiOptions<unknown, 'v3'>;
} & Omit<ApiMethodParams<BatchParameters>, 'setup'> &
    BatchCluster;

export type BatchCluster =
    // cluster or setup param should be required for the case of selection
    {cluster: string} | Required<Pick<ApiMethodParams<BatchParameters>, 'setup'>>;

export type BatchApiResults<T = unknown> = Array<BatchResultsItem<T>>;

export const executeBatchV3 = async (args: BatchApiArgs) => {
    const {id, parameters, data, cancellation, toaster} = args;
    try {
        const setup = 'setup' in args ? args.setup : undefined;
        const request = async () => {
            const results = await ytApiV3Id.executeBatch(id, {
                parameters,
                data,
                setup,
                cancellation,
            });

            const error = getBatchError(results, results[0].error?.message || 'Failed to batch');
            if (error) throw error;

            return results;
        };

        let results;

        if (toaster) {
            results = await wrapApiPromiseByToaster(request(), toaster);
        } else {
            results = await request();
        }

        const error = getBatchError(results, results[0].error?.message || 'Failed to batch');
        if (error) throw error;

        return {data: results};
    } catch (error: unknown) {
        return {error} as {error: YTError};
    }
};
