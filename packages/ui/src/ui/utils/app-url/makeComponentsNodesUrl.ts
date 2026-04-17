import {Page} from '../../../shared/constants/settings';
import {YT} from '../../config/yt-config';
import {Tab as ComponentsTab} from '../../constants/components/main';

type Params = {
    host?: string;
    cluster?: string;
};

export const makeComponentsNodesUrl = ({host, cluster}: Params = {}): string => {
    return host
        ? `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}/${host}`
        : `/${cluster || YT.cluster}/${Page.COMPONENTS}/${ComponentsTab.NODES}`;
};
