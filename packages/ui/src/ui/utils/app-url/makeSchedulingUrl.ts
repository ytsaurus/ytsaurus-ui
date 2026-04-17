import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    pool: string;
    poolTree: string;
    cluster?: string;
    tab?: 'attributes';
};

export const makeSchedulingUrl = ({pool, poolTree, cluster, tab}: Params): string => {
    const path = [cluster || YT.cluster, Page.SCHEDULING, tab].filter(Boolean).join('/');

    return `/${path}?pool=${pool}&poolTree=${poolTree}`;
};
