import {SingleProgress} from '../../../../store/actions/queries/api';

export const calculateQueryProgress = (progress: SingleProgress): number => {
    if (!progress) return 0;

    if (progress.spyt_progress) {
        return Math.round(progress.spyt_progress * 100);
    }

    if (progress.total_progress) {
        const {read_bytes, total_bytes_to_read} = progress.total_progress;
        return total_bytes_to_read > 0 ? Math.round(read_bytes / (total_bytes_to_read / 100)) : 0;
    }

    return 0;
};
