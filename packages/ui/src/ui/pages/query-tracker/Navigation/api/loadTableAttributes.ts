import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {JSONParser} from '../../module/api';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ClusterConfig} from '../../../../../shared/yt-types';

export const loadTableAttributes = (path: string, clusterConfig: ClusterConfig) => {
    return wrapApiPromiseByToaster<Record<string, any>>(
        ytApiV3Id.get(YTApiId.navigationAttributes, {
            setup: {
                proxy: getClusterProxy(clusterConfig),
                ...JSONParser,
            },
            parameters: {
                path: `${path}/@`,
            },
        }),
        {
            skipSuccessToast: true,
            toasterName: 'query_navigation_node_attributes',
            errorTitle: 'Navigation node get attributes failure',
        },
    );
};
