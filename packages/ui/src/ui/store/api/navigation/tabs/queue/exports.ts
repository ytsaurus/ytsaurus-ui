import {BaseQueryApi} from '@reduxjs/toolkit/query';
//@ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import ypath from '../../../../../common/thor/ypath';

import {RootState} from '../../../../../store/reducers';
import {ytApi} from '../../../../../store/api/yt';
import {getAttributes, getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';

import CancelHelper from '../../../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {prepareRequest} from '../../../../../utils/navigation';
import {YTApiId, ytApiV3} from '../../../../../rum/rum-wrap-api';
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

export async function exportsMutation(args: ExportsMutationArgs, api: BaseQueryApi) {
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
