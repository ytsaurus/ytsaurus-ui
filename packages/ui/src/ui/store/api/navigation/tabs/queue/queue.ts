import {rootApi} from '../../../../../store/api';

import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {createConsumer, unregisterConsumer} from './consumers';
import {exportsMutation} from './exports';

export const queueApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        export: build.mutation({
            queryFn: exportsMutation,
            invalidatesTags: [String(YTApiId.queueExportConfig)],
        }),
        createConsumer: build.mutation({
            queryFn: createConsumer,
            //invalidatesTags: [String(YTApiId.queueConsumerPartitions)],
        }),
        unregisterConsumer: build.mutation({
            queryFn: unregisterConsumer,
            //invalidatesTags: [String(YTApiId.queueConsumerPartitions)],
        }),
    }),
});

export const {useExportMutation, useCreateConsumerMutation, useUnregisterConsumerMutation} =
    queueApi;
