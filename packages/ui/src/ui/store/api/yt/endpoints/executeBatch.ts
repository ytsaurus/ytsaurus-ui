import {ApiMethodParams, BatchParameters, YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {BatchResultsItem} from '../../../../../shared/yt-types';
import {WrapApiOptions, getBatchError, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTError} from '../../../../types';

export type BatchApiArgs = {
    id: YTApiId;
    toaster?: WrapApiOptions<unknown, 'v3'>;
    cluster?: string;
<<<<<<< HEAD
=======
    clusterDependency?: boolean;
>>>>>>> 022ee636 (chore: setup rtk query and execute batch endpoint)
} & ApiMethodParams<BatchParameters>;

export type BatchApiResults<T = unknown> = Array<BatchResultsItem<T>>;

export const executeBatchV3 = async (args: BatchApiArgs) => {
    const {id, setup, parameters, data, cancellation, toaster} = args;
    try {
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
