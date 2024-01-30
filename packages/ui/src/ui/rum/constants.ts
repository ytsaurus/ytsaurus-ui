// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

const yt = ytLib();

export const YTErrors = {
    NODE_DOES_NOT_EXIST: yt.codes.NODE_DOES_NOT_EXIST,
    PERMISSION_DENIED: yt.codes.PERMISSION_DENIED,
    NO_SUCH_TRANSACTION: yt.codes.NO_SUCH_TRANSACTION, // User transaction * has expired or was aborted
    OPERATION_JOBS_LIMIT_EXEEDED: yt.codes.OPERATION_JOBS_LIMIT_EXEEDED,
    OPERATION_FAILED_TO_PREPARE: yt.codes.OPERATION_FAILED_TO_PREPARE,
};
