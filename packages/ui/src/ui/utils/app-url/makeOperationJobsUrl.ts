import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    cluster?: string;
    operationId: string;
    incarnationId?: string;
    jobId?: string;
    state?: 'all' | 'running' | 'completed' | 'failed' | 'aborted';
};

export const makeOperationJobsUrl = ({
    cluster,
    operationId,
    incarnationId,
    jobId,
    state,
}: Params): string => {
    const pathname = `/${cluster || YT.cluster}/${Page.OPERATIONS}/${operationId}/jobs`;

    const searchParams = new URLSearchParams();

    if (incarnationId) {
        searchParams.set('incarnation', incarnationId);
    }

    if (jobId) {
        searchParams.set('jobId', jobId);
    }

    if (state) {
        searchParams.set('state', state);
    }

    return searchParams.size > 0 ? `${pathname}?${searchParams}` : pathname;
};
