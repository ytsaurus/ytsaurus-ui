import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {rootApi} from '../../../../../store/api';

import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';
import {getTargetQueue} from '../../../../../store/selectors/navigation/tabs/consumer';
import {getCluster} from '../../../../../store/selectors/global';

import {ytApiV4} from '../../../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';

type RegisterConsumerArgs = {
    queuePath: string;
    queueCluster: string;
};

async function register(args: RegisterConsumerArgs, api: BaseQueryApi) {
    try {
        const {queuePath, queueCluster} = args;

        const state = api.getState() as RootState;
        const consumerPath = getPath(state);
        const consumerCluster = getCluster(state);
        const {vital} = getTargetQueue(state) ?? {vital: false};

        const response = await wrapApiPromiseByToaster(
            ytApiV4.executeBatch({
                parameters: {
                    requests: [
                        {
                            command: 'register_queue_consumer' as const,
                            parameters: {
                                vital,
                                queue_path: {
                                    $value: queuePath,
                                    $attributes: {cluster: queueCluster},
                                },
                                consumer_path: {
                                    $value: consumerPath,
                                    $attributes: {cluster: consumerCluster},
                                },
                            },
                        },
                    ],
                },
            }),
            {
                toasterName: 'register queue consumer',
                successContent: 'Registration of the consumer has started, this may take some time',
                skipErrorToast: true,
                batchType: 'v4',
                errorTitle: '',
            },
        );
        if (response.results[0]?.error) {
            throw response.results[0]?.error;
        }
        return {data: []};
    } catch (error) {
        return {error};
    }
}

const consumerApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        register: build.mutation({
            queryFn: register,
        }),
    }),
});

export const {useRegisterMutation} = consumerApi;
