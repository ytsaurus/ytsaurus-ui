// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import axios, {AxiosProgressEvent} from 'axios';

import {YT} from '../../config/yt-config';
import {getXsrfCookieName} from '../../utils';
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
    const clusterConfig = YT.clusters[opts.cluster];
    const externalProxy = clusterConfig.externalProxy;

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
                const xYTParameters = JSON.stringify({
                    path: filePath,
                    compute_md5: false,
                    ping: false,
                    transaction_id: transactionId,
                });

                return axios
                    .put(`//${externalProxy}/api/v3/write_file`, file, {
                        onUploadProgress: opts.handleUploadProgress,
                        withCredentials: true,
                        withXSRFToken: true,
                        xsrfCookieName: getXsrfCookieName(cluster),
                        xsrfHeaderName: 'X-Csrf-Token',
                        cancelToken: cancelHelper.generateNextToken(),
                        headers: {
                            'X-YT-Header-Format': '<encode_utf8=%false>json',
                            'X-Yt-Parameters-0': btoa(unescape(encodeURIComponent(xYTParameters))),
                        },
                    })
                    .then(() => {
                        return yt.v3.commitTransaction({transaction_id: transactionId});
                    })
                    .catch(async (err) => {
                        await yt.v3.abortTransaction({transaction_id: transactionId});

                        throw err;
                    });
            });
        });
};
