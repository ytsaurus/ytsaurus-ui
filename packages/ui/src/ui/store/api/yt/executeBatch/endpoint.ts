import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {getBatchError} from '../../../../../shared/utils/error';
import {type BatchParameters, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {type BatchResultsItem} from '../../../../../shared/yt-types';
import {type WrapApiOptions, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {type YTError} from '../../../../types';
import {type YTEndpointApiArgs} from '../types';

export type BatchApiArgs = YTEndpointApiArgs<BatchParameters> & {
    id: YTApiIdType;
    errorTitle: string;
    allowPartialResults?: boolean;
    toaster?: WrapApiOptions<unknown, 'v3'>;
};

export type BatchApiResults<T = unknown> = Array<BatchResultsItem<T>>;

export const executeBatchV3 = async (args: BatchApiArgs) => {
    const {id, errorTitle, parameters, data, cancellation, toaster, allowPartialResults} = args;
    try {
        const setup = 'setup' in args ? args.setup : undefined;
        const request = async () => {
            const results = await ytApiV3Id.executeBatch(id, {
                parameters,
                data,
                setup,
                cancellation,
            });

            if (!allowPartialResults) {
                const error = getBatchError(results, errorTitle);
                if (error) {
                    throw error;
                }
            }

            return results;
        };

        let results;

        if (toaster) {
            results = await wrapApiPromiseByToaster(
                request(),
                allowPartialResults ? {...toaster, batchType: undefined} : toaster,
            );
        } else {
            results = await request();
        }

        return {data: results};
    } catch (error: unknown) {
        return {error} as {error: YTError};
    }
};
