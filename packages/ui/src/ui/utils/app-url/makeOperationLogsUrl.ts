import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    cluster?: string;
    operationId: string;
};

export const makeOperationLogsUrl = ({cluster, operationId}: Params): string => {
    return `/${cluster || YT.cluster}/${Page.OPERATIONS}/${operationId}/logs`;
};
