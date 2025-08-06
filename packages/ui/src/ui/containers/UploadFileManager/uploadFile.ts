import {AxiosProgressEvent} from 'axios';

import {YT} from '../../config/yt-config';
import CancelHelper from '../../utils/cancel-helper';
import {ytApiV3} from '../../rum/rum-wrap-api';

interface StartUploadProps {
    file: File;
    cluster: string;
    filePath: string;
    handleUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
    cancelHelper: CancelHelper;
}

export const uploadFile = (opts: StartUploadProps) => {
    const {filePath, file, cluster} = opts;
    const clusterConfig = YT.clusters[cluster];
    const externalProxy = clusterConfig.externalProxy;
    const proxy = clusterConfig.proxy;

    const cancelHelper = opts.cancelHelper;

    return ytApiV3
        .create({
            path: filePath,
            type: 'file',
            recursive: true,
            ignore_existing: true,
        })
        .then(() => {
            return ytApiV3.startTransaction({}).then((transactionId: string) => {
                return ytApiV3
                    .writeFile({
                        setup: {
                            onUploadProgress: opts.handleUploadProgress,
                            proxy: externalProxy ?? proxy,
                        },
                        parameters: {
                            path: filePath,
                            compute_md5: false,
                            ping_ancestor_transactions: true,
                            transaction_id: transactionId,
                        },
                        cancellation: cancelHelper.removeAllAndSave,
                        data: file,
                    })
                    .then(() => {
                        return ytApiV3.commitTransaction({transaction_id: transactionId});
                    })
                    .catch(async (err: any) => {
                        await ytApiV3.abortTransaction({transaction_id: transactionId});

                        throw err;
                    });
            });
        });
};
