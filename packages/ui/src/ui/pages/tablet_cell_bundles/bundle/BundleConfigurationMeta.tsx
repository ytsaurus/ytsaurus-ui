import React from 'react';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import entries_ from 'lodash/entries';
import map_ from 'lodash/map';
import pick_ from 'lodash/pick';
import reduce_ from 'lodash/reduce';

import hammer from '../../../common/hammer';

import {
    getActiveBundleControllerData,
    getTabletsActiveBundleData,
} from '../../../store/selectors/tablet_cell_bundles';
import {fetchTabletCellBundleEditor} from '../../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import {OrchidBundlesData} from '../../../store/reducers/tablet_cell_bundles';
import Icon from '../../../components/Icon/Icon';
import MetaTable, {MetaTableItem} from '../../../components/MetaTable/MetaTable';
import {BundleMetaResourceProgress} from '../../../components/BundleMetaResourceProgress/BundleMetaResourceProgress';
import {Health} from '../../../components/Health/Health';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {printUsageLimit} from '../../../utils';
import {useUpdater} from '../../../hooks/use-updater';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {BatchSubRequest} from '../../../../shared/yt-types';

import './BundleConfigurationMeta.scss';

const block = cn('bundle-configuration-meta');

const DETAILS_KEYS = [
    'allocating_rpc_proxy_count',
    'allocating_tablet_node_count',
    'deallocating_rpc_proxy_count',
    'deallocating_tablet_node_count',
    'removing_cell_count',
] as const;

export function ActiveAccountBundleControllerUpdater() {
    const dispatch = useDispatch();
    const {bundle: activeBundle, enable_bundle_controller} =
        useSelector(getTabletsActiveBundleData) || {};
    const fetchFn = React.useCallback(() => {
        if (activeBundle) {
            dispatch(fetchTabletCellBundleEditor(activeBundle));
        }
    }, [dispatch, activeBundle]);
    useUpdater(fetchFn);

    const prevBundleControllerState = React.useRef<null | 'failed' | 'changing' | 'good'>(null);
    const checkBundleControllerState = React.useCallback(async () => {
        if (!activeBundle || !enable_bundle_controller) {
            return;
        }

        const requests: Array<BatchSubRequest> = [
            {
                command: 'get',
                parameters: {
                    path: `//sys/bundle_controller/orchid/bundle_controller/state/bundles/${activeBundle}/alerts`,
                },
            },
            ...map_(DETAILS_KEYS, (attr) => {
                return {
                    command: 'get' as const,
                    parameters: {
                        path: `//sys/bundle_controller/orchid/bundle_controller/state/bundles/${activeBundle}/${attr}`,
                    },
                };
            }),
        ];

        const [{output: alerts} = {output: []}, ...rest] = await wrapApiPromiseByToaster(
            ytApiV3Id.executeBatch(YTApiId.tabletBundleControllerState, {requests}),
            {
                toasterName: 'active-bundle-controller-status',
                skipSuccessToast: true,
                errorContent: `Cannot load bundle controller details for "${activeBundle}".`,
            },
        ).catch(() => []);

        const inProgressCount = reduce_(
            rest,
            (acc, {output}) => {
                return acc + (output ?? 0);
            },
            0,
        );

        const state = getState(alerts, inProgressCount);
        if (prevBundleControllerState.current === null) {
            prevBundleControllerState.current = state;
            return;
        }

        if (prevBundleControllerState.current !== state) {
            prevBundleControllerState.current = state;
            fetchFn();
        }
    }, [fetchFn, activeBundle, enable_bundle_controller]);
    useUpdater(checkBundleControllerState, {timeout: 3000});

    return null;
}

export default function BundleConfigurationMeta() {
    const {bundle_controller_target_config: bundleControllerConfig} =
        useSelector(getTabletsActiveBundleData) || {};
    const orchidData = useSelector(getActiveBundleControllerData);

    if (!bundleControllerConfig || !orchidData) {
        return null;
    }

    const bundleGroup: Array<MetaTableItem> = [];

    if (orchidData) {
        const {resource_quota, resource_allocated} = orchidData;
        const {memory: allMemory, vcpu: allVCPU} = resource_quota;
        const {memory: allocMemory, vcpu: allocVCPU} = resource_allocated;

        bundleGroup.push(
            getBundleStateField(orchidData),
            getLimitAllocatedField('Memory allocated/limit', allocMemory, allMemory, 'Bytes'),
            getLimitAllocatedField('vCPU allocated/limit', allocVCPU, allVCPU, 'vCores'),
        );
    }

    if (typeof bundleControllerConfig.rpc_proxy_count !== 'undefined') {
        const {
            rpc_proxy_count: count,
            rpc_proxy_resource_guarantee: {memory, vcpu},
        } = bundleControllerConfig;

        bundleGroup.push(getRpcNodeField('RPC proxies', count, memory, vcpu));
    }

    if (typeof bundleControllerConfig.tablet_node_count !== 'undefined') {
        const {
            tablet_node_count: count,
            tablet_node_resource_guarantee: {memory, vcpu},
        } = bundleControllerConfig;
        bundleGroup.push(getRpcNodeField('Tablet nodes', count, memory, vcpu));
    }

    if (bundleControllerConfig.memory_limits) {
        const {memory} = bundleControllerConfig?.tablet_node_resource_guarantee || {};
        bundleGroup.push(
            BundleMetaResourceProgress('Memory allocation', {
                data: bundleControllerConfig.memory_limits,
                resourceType: 'Bytes',
                limit: memory,
            }),
        );
    }

    if (bundleControllerConfig.cpu_limits) {
        bundleGroup.push(
            BundleMetaResourceProgress('vCPU allocation', {
                data: bundleControllerConfig.cpu_limits,
                resourceType: 'Number',
                postfix: 'threads',
            }),
        );
    }

    return (
        <MetaTable className={block()} subTitles={['Bundle configuration']} items={[bundleGroup]} />
    );
}

function getLimitAllocatedField(
    title: string,
    allocated: number,
    all: number,
    type: 'Bytes' | 'vCores',
) {
    const allStr = hammer.format[type](all);
    const allocatedStr = hammer.format[type](allocated);
    const percentage = hammer.format['Number']((allocated / all) * 100 || 0);

    return {
        key: title,
        value: (
            <span>
                {printUsageLimit(allocatedStr, allStr)}
                <span className={block('percentage')}>{percentage}%</span>
            </span>
        ),
    };
}

function getRpcNodeField(title: string, count: number, memory: number, vcpu: number) {
    const printMemory = hammer.format['Bytes'](memory);
    const printVCPU = hammer.format['vCores'](vcpu);
    return {
        key: title,
        value: count ? `${count} x (${printMemory}, ${printVCPU})` : 0,
    };
}

function getState(alerts?: OrchidBundlesData['alerts'], totalCounts = 0) {
    if (!alerts?.length && totalCounts === 0) {
        return 'good' as const;
    } else if (!alerts?.length && totalCounts > 0) {
        return 'changing' as const;
    }
    return 'failed' as const;
}

export function getBundleStateData(orchidData: OrchidBundlesData) {
    const alerts = orchidData.alerts;
    const detailsEntries = entries_(pick_(orchidData, DETAILS_KEYS));
    const totalCounts = reduce_(detailsEntries, (acc, [_k, v]) => acc + v, 0);
    const state = getState(alerts, totalCounts);
    return {state, detailsEntries};
}

function getBundleStateField(orchidData: OrchidBundlesData) {
    const {alerts} = orchidData;

    const {state: value, detailsEntries} = getBundleStateData(orchidData);
    if (value === 'good') {
        return {
            key: 'State',
            value: <Health className={block('health', {value})} value={value} />,
        };
    }

    if (value === 'changing') {
        return {
            key: 'State',
            value: (
                <Tooltip
                    content={renderDetails(detailsEntries)}
                    placement={'bottom'}
                    className={block('state-with-icon')}
                >
                    <Health className={block('health', {value})} value={value} />
                    &nbsp;
                    <Icon awesome="question-circle" />
                </Tooltip>
            ),
        };
    }

    return {
        key: 'State',
        value: (
            <Tooltip
                content={renderErrors(alerts)}
                placement={'bottom'}
                className={block('state-with-icon')}
            >
                <Health className={block('health', {value})} value={value} />
                &nbsp;
                <Icon awesome="exclamation-triangle" />
            </Tooltip>
        ),
    };
}

function renderDetails(details: Array<[string, number]>) {
    const list = details.map(([k, v]) => `${k} - ${v}`);
    return (
        <ul className={block('tooltip-list')}>
            {list.map((text, i) => {
                return (
                    <li key={i} className={block('tooltip-item')}>
                        {text}
                    </li>
                );
            })}
        </ul>
    );
}

function renderErrors(alerts: OrchidBundlesData['alerts']) {
    return (
        <ol className={block('tooltip-list', {alerts: true})}>
            {alerts.map((alert) => {
                return (
                    <li key={alert.id} className={block('tooltip-item')}>
                        {alert.id} - {alert.description}
                    </li>
                );
            })}
        </ol>
    );
}
