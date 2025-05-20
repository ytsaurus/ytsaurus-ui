import {BaseQueryApi} from '@reduxjs/toolkit/query';
//@ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import ypath from '../../../../../common/thor/ypath';

import {RootState} from '../../../../../store/reducers';
import {rootApi} from '../../../../../store/api';
import {ytApi} from '../../../../../store/api/yt';
import {getAttributes, getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';

import CancelHelper from '../../../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {prepareRequest} from '../../../../../utils/navigation';
import {YTApiId, ytApiV3, ytApiV4} from '../../../../../rum/rum-wrap-api';
import {QueueExport, QueueExportConfig} from '../../../../../types/navigation/queue/queue';

const cancelHelper = new CancelHelper();

type Config = QueueExportConfig<number> & {export_name: string};

type ExportsMutationArgs = {
    type: 'delete' | 'edit';
    prevConfig?: Config;
    newConfig?: Config;
};

export const makeGetExportsParams = (path: string) => ({
    id: YTApiId.queueExportConfig,
    errorTitle: 'Failed to get export config',
    parameters: {
        requests: [
            {
                command: 'get' as const,
                parameters: prepareRequest('static_export_config', {path: `${path}/@`}),
            },
        ],
    },
});

async function deleteExtraAttributes(
    configs: QueueExport<number>,
    prevConfig: Config,
    transactionId: string,
) {
    await ytApiV3.remove({
        path: `${configs[prevConfig.export_name].export_directory}/@queue_static_export_destination`,
        cancellation: cancelHelper.removeAllAndSave,
        transaction_id: transactionId,
    });

    await ytApiV3.remove({
        path: `${configs[prevConfig.export_name].export_directory}/@queue_static_export_progress`,
        cancellation: cancelHelper.removeAllAndSave,
        transaction_id: transactionId,
    });
}

async function exportsMutation(args: ExportsMutationArgs, api: BaseQueryApi) {
    try {
        const state = api.getState() as RootState;
        const path = getPath(state);
        const attributes = getAttributes(state);
        const cluster = getCluster(state);

        const {prevConfig, type, newConfig} = args;

        const configs: QueueExport<number> = ytApi.endpoints.fetchBatch.select({
            ...makeGetExportsParams(path),
            cluster,
        })(state).data?.[0].output as QueueExport<number>;

        const newConfigs = {...configs};

        if (prevConfig?.export_name && newConfigs[prevConfig?.export_name]) {
            delete newConfigs[prevConfig?.export_name];
        }

        if (type === 'edit' && newConfig?.export_name) {
            newConfigs[newConfig?.export_name] = newConfig;
        }

        const transactionId = await yt.v3.startTransaction({});
        try {
            await ytApiV3.set(
                {
                    path: `${path}/@static_export_config`,
                    cancellation: cancelHelper.removeAllAndSave,
                    transaction_id: transactionId,
                },
                newConfigs,
            );

            if (type === 'edit' && newConfig) {
                if (prevConfig && prevConfig.export_directory !== newConfig.export_directory) {
                    await deleteExtraAttributes(configs, prevConfig, transactionId);
                }
                await ytApiV3.set(
                    {
                        path: `${newConfig.export_directory}/@queue_static_export_destination`,
                        cancellation: cancelHelper.removeAllAndSave,
                        transaction_id: transactionId,
                    },
                    {
                        originating_queue_id: `${ypath.getValue(attributes, '/id')}`,
                    },
                );
            }

            if (type === 'delete' && prevConfig?.export_name) {
                await deleteExtraAttributes(configs, prevConfig, transactionId);
            }

            await wrapApiPromiseByToaster(
                yt.v3.commitTransaction({transaction_id: transactionId}),
                {
                    toasterName: 'exports_config_update',
                    successContent: 'Exports config successfully updated',
                },
            );
            return {data: {}};
        } catch (error) {
            await yt.v3.abortTransaction({transaction_id: transactionId});
            return {error};
        }
    } catch (error) {
        return {error};
    }
}

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
        console.log(transactionId);
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

async function unregisterConsumer(
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

export const queueApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        export: build.mutation({
            queryFn: exportsMutation,
            invalidatesTags: [String(YTApiId.queueExportConfig)],
        }),
        createConsumer: build.mutation({
            queryFn: createConsumer,
            invalidatesTags: [String(YTApiId.queueConsumerPartitions)],
        }),
        unregisterConsumer: build.mutation({
            queryFn: unregisterConsumer,
            invalidatesTags: [String(YTApiId.queueConsumerPartitions)],
        }),
    }),
});

export const {useExportMutation, useCreateConsumerMutation, useUnregisterConsumerMutation} =
    queueApi;
