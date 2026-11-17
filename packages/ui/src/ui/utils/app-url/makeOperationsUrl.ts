import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    cluster?: string;
};

export const makeOperationsUrl = ({cluster}: Params): string => {
    return `/${cluster || YT.cluster}/${Page.OPERATIONS}`;
};
