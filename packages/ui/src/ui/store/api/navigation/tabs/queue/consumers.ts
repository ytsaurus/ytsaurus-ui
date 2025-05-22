import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';

import {ytApiV3, ytApiV4} from '../../../../../rum/rum-wrap-api';

type ConsumersMutationArgs = {
    consumerPath: string;
    consumerCluster: string;
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

export async function createConsumer(args: ConsumersMutationArgs, api: BaseQueryApi) {
    try {
        const {vital, register, consumerPath, consumerCluster} = args;

        const state = api.getState() as RootState;
        const queuePath = getPath(state);
        const queueCluster = getCluster(state);

        const response = await ytApiV3.create({
            parameters: {
                type: 'queue_consumer',
                path: {
                    $value: consumerPath,
                    $attributes: {
                        cluster: consumerCluster,
                    },
                },
            },
        });

        console.log(response);

        if (register) {
            const response = await ytApiV4.executeBatch({
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
            });
            if (response.results[0]?.error) {
                throw response.results[0]?.error;
            }
        }

        return {data: []};
    } catch (error) {
        return {error};
    }
}

export async function registerConsumer(
    args: Pick<ConsumersMutationArgs, 'consumerPath'> & {vital: boolean},
    api: BaseQueryApi,
) {
    try {
        const {vital, consumerPath} = args;

        const state = api.getState() as RootState;
        const queue_path = getPath(state);

        await ytApiV4.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'register_queue_consumer' as const,
                        parameters: {
                            vital,
                            queue_path,
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

export async function unregisterConsumer(
    args: Pick<ConsumersMutationArgs, 'consumerPath'>,
    api: BaseQueryApi,
) {
    try {
        const {consumerPath} = args;

        const state = api.getState() as RootState;
        const queue_path = getPath(state);

        await ytApiV4.executeBatch({
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
        });

        return {data: []};
    } catch (error) {
        return {error};
    }
}
