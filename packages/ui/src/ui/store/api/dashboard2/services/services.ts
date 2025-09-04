import {BatchResultsItem} from './../../../../../shared/yt-types.d';
import {BaseQueryApi} from '@reduxjs/toolkit/query';

import map_ from 'lodash/map';
import filter_ from 'lodash/filter';
import find_ from 'lodash/find';

import {getBatchError} from '../../../../../shared/utils/error';

import format from '../../../../common/hammer/format';
import ypath from '../../../../common/thor/ypath';

import {RootState} from '../../../../store/reducers';
import {isDeveloper} from '../../../../store/selectors/global/is-developer';

import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {StrawberryCliqueHealthType, chytApiAction} from '../../../../utils/strawberryControllerApi';
import {defaultColumns} from '../../../../constants/chyt';
import {YTError, YTHealth} from '../../../../types';
import {Page} from '../../../../../shared/constants/settings';
import {USE_MAX_SIZE} from '../../../../../shared/constants/yt-api';
import {pluralize} from '../../../../utils';
import {UNKNOWN_ITEM_NAME} from '../../../../constants/dashboard2';

export type ServiceInfo = {
    general: {name: string; url?: string; error?: YTError};
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
        command: 'list' as const,
        parameters: {
            path: '//sys/tablet_cells',
            attributes: ['tablet_cell_bundle'],
            ...USE_MAX_SIZE,
        },
    },
    ...map_(items, ({item}) => ({
        command: 'get' as const,
        parameters: {
            path: `//sys/tablet_cell_bundles/${item}`,
            attributes: ['health', 'bundle_controller_target_config', 'enable_bundle_controller'],
        },
    })),
];

function makeServiceConfig(instances: number, memory: string, cpu: string) {
    let config = '0 instances';
    if (instances !== 0) {
        config = `${instances} x (${memory}, ${cpu})`;
    }
    return config;
}

type BundleControllerTargetConfig = {
    tablet_node_resource_guarantee?: {
        memory?: number;
        vcpu?: number;
    };
    tablet_node_count?: number;
};

type BundleInfo = {
    health?: YTHealth;
    bundle_controller_target_config: BundleControllerTargetConfig;
    enable_bundle_controller?: boolean;
};

type TabletCellInfo = {tablet_cell_bundle?: string};

type TabletCellsResponse = Array<{$attributes: TabletCellInfo; $value?: string}>;

type BundlesResponse = {
    $attributes: BundleInfo;
    $value?: string | null;
};

export type DashboardBundlesResponse = TabletCellsResponse | BundlesResponse;

async function fetchBundles(items: ServicesItem[], cluster: string) {
    const bundlesResponse = await ytApiV3Id.executeBatch<DashboardBundlesResponse>(
        YTApiId.tabletCellBundles,
        {
            parameters: {requests: bundlesRequests(items)},
        },
    );

    const [cells, ...bundles] = bundlesResponse;

    if (!bundlesResponse?.length) return [];
    const bundlesInfo = map_(bundles || [], ({output, error}, idx) => {
        if (error) {
            return {
                type: 'Bundle',
                general: {
                    name: items?.[idx]?.item || UNKNOWN_ITEM_NAME,
                    error: error,
                },
            };
        }

        if (!output) {
            return undefined;
        }

        const item = ypath.getAttributes(output) as BundleInfo;

        let memory = format.NO_VALUE;
        let cpu = format.NO_VALUE;
        let instances = 0;

        let config = '';
        if (item?.enable_bundle_controller) {
            memory = format.Bytes(
                item?.bundle_controller_target_config?.tablet_node_resource_guarantee?.memory ||
                    format.NO_VALUE,
            );
            cpu = format.vCores(
                item?.bundle_controller_target_config?.tablet_node_resource_guarantee?.vcpu ||
                    format.NO_VALUE,
            );
            instances = Number(item?.bundle_controller_target_config?.tablet_node_count || 0);
            config = makeServiceConfig(instances, memory, cpu);
        } else {
            const cellsCount =
                (cells as BatchResultsItem<TabletCellsResponse>)?.output?.filter?.(
                    (cell) =>
                        (ypath.getAttributes(cell) as TabletCellInfo)?.tablet_cell_bundle ===
                        items?.[idx]?.item,
                )?.length || 0;
            config = `${cellsCount} tablet ${pluralize(cellsCount, 'cell', 'cells')}`;
        }

        return {
            type: 'Bundle' as const,
            general: {
                name: items?.[idx]?.item || 'unknown',
                url: makeItemLink('bundle', items?.[idx]?.item || 'unknown', cluster),
            },
            status: item?.health,
            config,
        };
    }).filter(Boolean) as ServiceInfo[];

    return bundlesInfo;
}

async function fetchChyt(items: ServicesItem[], cluster: string, isAdmin: boolean) {
    if (!items?.length) {
        return [];
    }

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

    const cliques: ServiceInfo[] = map_(cliquesResponses, ([alias, item]) => {
        const instances = Number(item?.instance_count || 0);
        const cpu = `${(item?.total_cpu || 0) / instances} ${item?.total_cpu && item?.total_cpu > 1 ? 'cores' : 'core'}`;
        const memory = format.Bytes((item?.total_memory || 0) / instances || format.NO_VALUE);

        return {
            type: 'CHYT' as const,
            general: {
                name: alias || 'unkwnown',
                url: makeItemLink('chyt', alias, cluster),
            },
            status: item?.health,
            config: makeServiceConfig(instances, memory, cpu),
        };
    });

    map_(items, (item) => {
        if (!cliques.find((clique) => clique.general.name === item.item)) {
            cliques.push({
                type: 'CHYT' as const,
                general: {
                    name: item.item,
                    error: {
                        code: 500,
                        message: `Can not find ${item.item} clique on current cluster`,
                    },
                },
                config: format.NO_VALUE,
            });
        }
    });

    return cliques;
}

type FetchServicesArgs = {
    type: 'favourite' | 'custom';
    id: string;
    cluster: string;
    customItems?: ServicesItem[];
    favouriteCliques: Array<{item: string; path: string}>;
    favouriteBundles: Array<{item: string; path: string}>;
};

export async function fetchServices(args: FetchServicesArgs, api: BaseQueryApi) {
    try {
        const {type, cluster, customItems, favouriteCliques, favouriteBundles} = args;

        const state = api.getState() as RootState;
        const isAdmin = isDeveloper(state);

        let items: ServicesItem[] = [];

        if (type === 'favourite') {
            items = [
                ...favouriteCliques.map((clique) => ({service: 'chyt', item: clique.path})),
                ...favouriteBundles.map((bundle) => ({service: 'bundle', item: bundle.path})),
            ];
        } else {
            items = customItems || [];
        }

        const requestedCliques = filter_(items, ({service}) => service === 'chyt');
        const requestedBundles = filter_(items, ({service}) => service === 'bundle');

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
