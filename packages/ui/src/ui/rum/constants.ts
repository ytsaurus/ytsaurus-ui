// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

const yt = ytLib();

export const YTErrors = {
    NODE_DOES_NOT_EXIST: yt.codes.NODE_DOES_NOT_EXIST, // 500
    PERMISSION_DENIED: yt.codes.PERMISSION_DENIED, // 901
    NO_SUCH_TRANSACTION: yt.codes.NO_SUCH_TRANSACTION, // User transaction * has expired or was aborted, code: 11000
    OPERATION_JOBS_LIMIT_EXEEDED: yt.codes.OPERATION_JOBS_LIMIT_EXEEDED, // 215
    OPERATION_FAILED_TO_PREPARE: yt.codes.OPERATION_FAILED_TO_PREPARE, // 216
    CANCELLED: yt.codes.CANCELLED, // cancelled
    NO_SUCH_USER: yt.codes.NO_SUCH_USER, // 900
};
