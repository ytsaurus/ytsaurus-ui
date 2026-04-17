import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';

type Params = {
    bundle: string;
    cluster?: string;
};

export const makeBundleUrl = ({bundle, cluster}: Params): string => {
    return `/${cluster || YT.cluster}/${Page.TABLET_CELL_BUNDLES}/instances?activeBundle=${bundle}`;
};
