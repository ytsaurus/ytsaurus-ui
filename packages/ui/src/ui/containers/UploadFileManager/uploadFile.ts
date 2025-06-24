// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {AxiosProgressEvent} from 'axios';

import {YT} from '../../config/yt-config';
import CancelHelper from '../../utils/cancel-helper';

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

    return yt.v3
        .create({
            path: filePath,
            type: 'file',
            recursive: true,
            ignore_existing: true,
        })
        .then(() => {
            return yt.v3.startTransaction({}).then((transactionId: string) => {
                return yt.v3
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
                        cancelToken: cancelHelper.generateNextToken(),
                        data: file,
                    })
                    .then(() => {
                        return yt.v3.commitTransaction({transaction_id: transactionId});
                    })
                    .catch(async (err: any) => {
                        await yt.v3.abortTransaction({transaction_id: transactionId});

                        throw err;
                    });
            });
        });
};
