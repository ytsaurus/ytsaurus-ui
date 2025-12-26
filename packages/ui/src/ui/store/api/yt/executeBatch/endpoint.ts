import {YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {getBatchError} from '../../../../../shared/utils/error';
import {BatchParameters, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {BatchResultsItem} from '../../../../../shared/yt-types';
import {WrapApiOptions, wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTError} from '../../../../types';
import {YTEndpointApiArgs} from '../types';

export type BatchApiArgs = YTEndpointApiArgs<BatchParameters> & {
    id: YTApiIdType;
    errorTitle: string;
    toaster?: WrapApiOptions<unknown, 'v3'>;
};

export type BatchApiResults<T = unknown> = Array<BatchResultsItem<T>>;

export const executeBatchV3 = async (args: BatchApiArgs) => {
    const {id, errorTitle, parameters, data, cancellation, toaster} = args;
    try {
        const setup = 'setup' in args ? args.setup : undefined;
        const request = async () => {
            const results = await ytApiV3Id.executeBatch(id, {
                parameters,
                data,
                setup,
                cancellation,
            });

            const error = getBatchError(results, errorTitle);
            if (error) throw error;

            return results;
        };

        let results;

        if (toaster) {
            results = await wrapApiPromiseByToaster(request(), toaster);
        } else {
            results = await request();
        }

        const error = getBatchError(results, errorTitle);
        if (error) throw error;

        return {data: results};
    } catch (error: unknown) {
        return {error} as {error: YTError};
    }
};
