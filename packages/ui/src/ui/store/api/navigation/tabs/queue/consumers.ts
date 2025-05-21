import {BaseQueryApi} from '@reduxjs/toolkit/query';
//@ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {RootState} from '../../../../../store/reducers';
import {getPath} from '../../../../../store/selectors/navigation';

import {ytApiV3, ytApiV4} from '../../../../../rum/rum-wrap-api';

type ConsumersMutationArgs = {
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

export async function createConsumer(args: ConsumersMutationArgs, api: BaseQueryApi) {
    try {
        const {vital, register, consumerPath} = args;

        const state = api.getState() as RootState;
        const queue_path = getPath(state);

        const transactionId = await yt.v3.startTransaction({});

        try {
            await ytApiV3.create({
                type: 'queue_consumer',
                path: `${consumerPath}`,
                transactionId: transactionId,
            });

            if (register) {
                await ytApiV4.executeBatch({
                    parameters: {
                        requests: [
                            {
                                command: 'register_queue_consumer' as const,
                                parameters: {
                                    vital,
                                    queue_path,
                                    consumer_path: consumerPath,
                                    transaction_id: transactionId,
                                },
                            },
                        ],
                    },
                });
            }
        } catch (error) {
            await yt.v3.abortTransaction({transaction_id: transactionId});
        }

        await yt.v3.commitTransaction({transaction_id: transactionId});

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
