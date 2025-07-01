import {BaseQueryApi} from '@reduxjs/toolkit/query';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import find_ from 'lodash/find';

import hammer from '../../../../common/hammer';
import ypath from '../../../../common/thor/ypath';

import {RootState} from '../../../../store/reducers';
import {isDeveloper} from '../../../../store/selectors/global/is-developer';

import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {getBatchError} from '../../../../utils/utils';
import {StrawberryCliqueHealthType, chytApiAction} from '../../../../utils/strawberryControllerApi';
import {defaultColumns} from '../../../../constants/chyt';
import {YTHealth} from '../../../../types';
import {Page} from '../../../../../shared/constants/settings';

export type ServiceInfo = {
    general: {name: string; url: string};
    type: 'Bundle' | 'CHYT';
    status?: YTHealth | StrawberryCliqueHealthType;
    config: string;
};

export type ServicesItem = {
    service: string;
    item: string;
};

const makeItemLink = (type: 'chyt' | 'bundle', name: string, cluster: string) => {
    const page = type === 'chyt' ? Page.CHYT : Page.TABLET_CELL_BUNDLES;
    const itemParam = type === 'chyt' ? name : `instances?activeBundle=${name}`;
    return `/${cluster}/${page}/${itemParam}`;
};

const bundlesRequests = (items: ServicesItem[]) => [
    {
        command: 'exists' as const,
        parameters: {
            path: '//sys/bundle_controller/orchid/bundle_controller/state/bundles',
        },
    },
    ...map_(items, ({item}) => ({
        command: 'get' as const,
        parameters: {
            path: `//sys/tablet_cell_bundles/${item}`,
            attributes: ['health', 'bundle_controller_target_config'],
        },
    })),
];

async function fetchBundles(items: ServicesItem[], cluster: string) {
    const response = await ytApiV3Id.executeBatch(YTApiId.tabletCellBundles, {
        parameters: {requests: bundlesRequests(items)},
    });

    const error = getBatchError(response, 'Tablet cell bundles cannot be loaded');
    if (error) {
        throw error;
    }

    const [isBundlesSupported, ...bundles] = response;

    if (!isBundlesSupported || !bundles?.length) return [];

    const bundlesInfo = map_(bundles, ({output}, idx) => {
        if (!output) {
            return undefined;
        }

        const item = output?.$attributes;

        const memory = hammer.format['Bytes'](
            item?.bundle_controller_target_config?.tablet_node_resource_guarantee?.memory || '',
        );
        const cpu = hammer.format['vCores'](
            item?.bundle_controller_target_config?.tablet_node_resource_guarantee?.vcpu || '',
        );
        const instances = item?.bundle_controller_target_config?.tablet_node_count;

        return {
            type: 'Bundle' as const,
            general: {
                name: items?.[idx]?.item || 'unknown',
                url: makeItemLink('bundle', items?.[idx]?.item || 'unknown', cluster),
            },
            status: item?.health as YTHealth,
            config: `${instances} x (${memory}, ${cpu})`,
        };
    }).filter(Boolean) as ServiceInfo[];

    return bundlesInfo;
}

async function fetchChyt(items: ServicesItem[], cluster: string, isAdmin: boolean) {
    const cliquesList = await chytApiAction(
        'list',
        cluster,
        {
            attributes: [
                'yt_operation_id' as const,
                'creator' as const,
                'state' as const,
                'health' as const,
                'health_reason' as const,
                ...defaultColumns,
            ],
        },
        {isAdmin},
    );

    const cliquesResponses = cliquesList.result
        .map((item) => [ypath.getValue(item), ypath.getAttributes(item)])
        .filter(([alias]) => items.map((i) => i.item).includes(alias));

    const cliques = map_(cliquesResponses, ([alias, item]) => {
        const instances = item?.instance_count || 0;
        const cpu = `${(item?.total_cpu || 0) / instances} ${item?.total_cpu && item?.total_cpu > 1 ? 'cores' : 'core'}`;
        const memory = hammer.format['Bytes']((item?.total_memory || 0) / instances || '');

        return {
            type: 'CHYT' as const,
            general: {
                name: alias || 'unkwnown',
                url: makeItemLink('chyt', alias, cluster),
            },
            status: item?.health,
            config: `${instances} x (${memory}, ${cpu})`,
        };
    });

    return cliques;
}

type FetchServicesArgs = {
    id: string;
    cluster: string;
    items?: ServicesItem[];
};

export async function fetchServices(args: FetchServicesArgs, api: BaseQueryApi) {
    try {
        const {cluster, items} = args;

        const state = api.getState() as RootState;
        const isAdmin = isDeveloper(state);

        const requestedCliques = filter_(items, ({service}) => service === 'chyt');
        const requestedBundles = filter_(items, ({service}) => service === 'bundle');
        //Boolean(getClusterUiConfig(state).chyt_controller_base_url)
        const cliques = await fetchChyt(requestedCliques, cluster, isAdmin);
        const bundles = await fetchBundles(requestedBundles, cluster);

        return {
            data: map_(items, (item) =>
                find_([...bundles, ...cliques], (i) => item.item === i.general.name),
            ).filter(Boolean) as ServiceInfo[],
        };
    } catch (error) {
        return {error};
    }
}
