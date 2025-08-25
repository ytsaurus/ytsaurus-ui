import {QueryToken} from '../../../../../shared/constants/settings-types';
import i18n from './i18n';
import {YT} from '../../../../config/yt-config';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ytApiV3} from '../../../../rum/rum-wrap-api';

export const tokenPathValidator = async (value: string, formValues?: QueryToken) => {
    const trimmedPath = value.trim();
    if (!trimmedPath) {
        return i18n('alert_path-required');
    }

    const cluster = formValues?.cluster?.[0];
    if (!cluster) {
        return i18n('alert_cluster-required');
    }

    const clusterConfig = YT.clusters[cluster];
    if (!clusterConfig) {
        return i18n('alert_cluster-config-error');
    }

    try {
        const proxy = getClusterProxy(clusterConfig);
        const exists = await ytApiV3.exists({
            setup: {proxy},
            parameters: {path: value},
        });

        if (!exists) {
            return i18n('alert_path-not-exist');
        }

        // Check node type - only document nodes are allowed
        const node = await ytApiV3.get({
            setup: {proxy},
            parameters: {
                path: `${value}/@`,
                attributes: ['type'],
                output_format: 'json',
            },
        });

        if (node.type !== 'file') {
            return i18n('alert_path-not-file');
        }
    } catch (error) {
        return (error as Error).message;
    }

    return undefined;
};
