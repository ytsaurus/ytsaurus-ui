import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {rootApi} from '../../../../../store/api';

import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';
import {getTargetQueue} from '../../../../../store/selectors/navigation/tabs/consumer';

import {ytApiV4} from '../../../../../rum/rum-wrap-api';

type RegisterConsumerArgs = {
    queuePath: string;
};

async function register(args: RegisterConsumerArgs, api: BaseQueryApi) {
    try {
        const {queuePath} = args;

        const state = api.getState() as RootState;
        const consumerPath = getPath(state);
        const {vital} = getTargetQueue(state) ?? {vital: false};

        await ytApiV4.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'register_queue_consumer' as const,
                        parameters: {
                            vital,
                            queue_path: queuePath,
                            consumer_path: consumerPath,
                        },
                    },
                ],
            },
        });
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
