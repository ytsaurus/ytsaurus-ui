// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

const yt = ytLib();

export const YTErrors: number[] = [
    yt.codes.NODE_DOES_NOT_EXIST,
    yt.codes.PERMISSION_DENIED,
    yt.codes.NO_SUCH_TRANSACTION, // User transaction * has expired or was aborted
];
