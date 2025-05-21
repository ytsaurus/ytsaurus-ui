import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';

import {ytApiV3, ytApiV4} from '../../../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {BatchResultsItem} from '../../../../../../shared/yt-types';

type CreateConsumersMutationArgs = {
    consumerPath: string;
} & (
    | {
          register?: false | undefined;
          vital?: boolean;
      }
    | {
          register: true;
          vital: boolean;
      }
);

export async function createConsumer(args: CreateConsumersMutationArgs, api: BaseQueryApi) {
    try {
        const {vital, register, consumerPath} = args;

        const state = api.getState() as RootState;
        const queuePath = getPath(state);

        await ytApiV3.create({
            parameters: {
                type: 'queue_consumer',
                path: consumerPath,
            },
        });

        if (register) {
            const response = await wrapApiPromiseByToaster<
                {results: BatchResultsItem<unknown>[]},
                'v4'
            >(
                ytApiV4.executeBatch({
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
                }),
                {
                    toasterName: 'register queue consumer',
                    successContent:
                        'Registration of the consumer has started, this may take some time',
                    skipErrorToast: true,
                    batchType: 'v4',
                    errorTitle: '',
                },
            );
            if (response.results[0]?.error) {
                throw response.results[0]?.error;
            }
        }

        return {data: []};
    } catch (error) {
        return {error};
    }
}

type RegisterConsumersMutationArgs = {
    consumerPath: string;
    consumerCluster: string;
    vital: boolean;
};

export async function registerConsumer(args: RegisterConsumersMutationArgs, api: BaseQueryApi) {
    try {
        const {vital, consumerPath, consumerCluster} = args;

        const state = api.getState() as RootState;
        const queuePath = getPath(state);
        const queueCluster = getCluster(state);

        const response = await wrapApiPromiseByToaster<
            {results: BatchResultsItem<unknown>[]},
            'v4'
        >(
            ytApiV4.executeBatch({
                parameters: {
                    requests: [
                        {
                            command: 'register_queue_consumer' as const,
                            parameters: {
                                vital,
                                queue_path: {
                                    $value: queuePath,
                                    $attributes: {
                                        cluster: queueCluster,
                                    },
                                },
                                consumer_path: {
                                    $value: consumerPath,
                                    $attributes: {
                                        cluster: consumerCluster,
                                    },
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

export async function unregisterConsumer(args: {consumerPath: string}, api: BaseQueryApi) {
    try {
        const {consumerPath} = args;

        const state = api.getState() as RootState;
        const queue_path = getPath(state);

        const response = await wrapApiPromiseByToaster(
            ytApiV4.executeBatch({
                parameters: {
                    requests: [
                        {
                            command: 'unregister_queue_consumer' as const,
                            parameters: {
                                queue_path,
                                consumer_path: consumerPath,
                            },
                        },
                    ],
                },
            }),
            {
                toasterName: 'unregister queue consumer',
                successContent:
                    'Unregistration of the consumer has started, this may take some time',
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
