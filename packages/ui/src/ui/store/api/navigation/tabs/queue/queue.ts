import {rootApi} from '../../../../../store/api';

import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {createConsumer, registerConsumer, unregisterConsumer} from './consumers';
import {exportsMutation} from './exports';

export const queueApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        export: build.mutation({
            queryFn: exportsMutation,
            invalidatesTags: [YTApiId.queueExportConfig],
        }),
        createConsumer: build.mutation({
            queryFn: createConsumer,
        }),
        unregisterConsumer: build.mutation({
            queryFn: unregisterConsumer,
        }),
        registerConsumer: build.mutation({
            queryFn: registerConsumer,
        }),
    }),
});

export const {
    useExportMutation,
    useCreateConsumerMutation,
    useRegisterConsumerMutation,
    useUnregisterConsumerMutation,
} = queueApi;
