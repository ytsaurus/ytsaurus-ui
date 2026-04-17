import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    cluster?: string;
    operationId: string;
    jobId: string;
};

export const makeOperationJobUrl = ({cluster, operationId, jobId}: Params): string => {
    return `/${cluster || YT.cluster}/${Page.JOB}/${operationId}/${jobId}`;
};
