import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    cluster?: string;
    operationId: string;
    logName?: string;
};

export const makeOperationLogsUrl = ({cluster, operationId, logName}: Params): string => {
    const pathname = `/${cluster || YT.cluster}/${Page.OPERATIONS}/${operationId}/logs`;

    const searchParams = new URLSearchParams();

    if (logName) {
        searchParams.set('logName', logName);
    }

    return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
};
