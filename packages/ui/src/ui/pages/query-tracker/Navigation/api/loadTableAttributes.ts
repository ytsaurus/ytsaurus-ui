import {getBatchError} from '../../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {JSONParser} from '../../module/api';
import {getClusterProxy} from '../../../../store/selectors/global';
import {BatchSubRequest, ClusterConfig} from '../../../../../shared/yt-types';
import {Toaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

export const loadTableAttributes = async (path: string, clusterConfig: ClusterConfig) => {
    const setup = {
        proxy: getClusterProxy(clusterConfig),
        ...JSONParser,
    };

    const requests: BatchSubRequest[] = [
        {
            command: 'get' as const,
            parameters: {
                path: `${path}/@`,
            },
        },
        {
            command: 'get' as const,
            parameters: {
                path: `${path}/@schema`,
            },
        },
    ];

    try {
        const results = await ytApiV3Id.executeBatch(YTApiId.navigationGetPath, {
            parameters: {requests},
            setup,
        });

        const error = getBatchError(results, 'Failed to get navigation attributes');
        if (error) throw error;

        return {
            ...results[0].output,
            schema: {
                ...results[1].output,
            },
        };
    } catch (e) {
        toaster.add({
            name: 'load_table_attributes',
            theme: 'danger',
            title: 'Failed to load table attributes',
            content: (e as Error).message,
        });
        return {};
    }
};
