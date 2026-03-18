import cn from 'bem-cn-lite';
import React from 'react';
import {useSelector} from 'react-redux';

import {CircleInfo, TriangleExclamation} from '@gravity-ui/icons';
import {Flex, Icon, Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import {ChargeLevel} from '../../../../../components/ChargeLevel/ChargeLevel';
import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {ColorCircle} from '../../../../../components/ColorCircle/ColorCircle';
import {MetaTable, type MetaTableItem, Tooltip, YTText} from '@ytsaurus/components';
import {ROOT_POOL_NAME} from '../../../../../constants/scheduling';
import {
    getCurrentPool,
    getSchedulingTreeMainResource,
} from '../../../../../store/selectors/scheduling/scheduling';
import {
    PoolStaticConfigurationItem,
    getCurrentPoolGuarantees,
} from '../../../../../store/selectors/scheduling/scheduling-ts';
import {addProgressStackSpacers} from '../../../../../utils/progress';
import {PoolData} from '../../../../../utils/scheduling/pool-child';
import {calcProgressProps2} from '../../../../../utils/utils';

import i18n from './i18n';
import './SchedulingMeta.scss';

const block = cn('yt-scheduling-meta');

export function SchedulingMeta() {
    const pool = useSelector(getCurrentPool);

    const guarantees = useSelector(getCurrentPoolGuarantees);
    const mainResource = useSelector(getSchedulingTreeMainResource);

    // eslint-disable-next-line complexity
    const {items, subTitles} = React.useMemo(() => {
        const {mode, resources, integralType, flowCPU = 0, flowGPU = 0, weight} = pool ?? {};
        const {cpu, gpu, user_memory} = resources ?? {};

        const hasIntegralType =
            (integralType && integralType !== 'none') || flowCPU > 0 || flowGPU > 0;

        const guaranteeType = hasIntegralType ? format.ReadableField(integralType) : '';

        const burstUnit = formatUnits(guarantees.burst);
        const flowUnit = formatUnits(guarantees.flow);

        const res = {
            items: [
                [
                    {key: i18n('mode'), value: format.ReadableField(mode)},
                    {key: i18n('weight'), value: format.Number(weight)},
                    {
                        key: i18n('operations-running'),
                        value: renderOperationsProgress(pool, 'running'),
                    },
                    {
                        key: i18n('operations'),
                        value: renderOperationsProgress(pool, 'total'),
                    },
                ],
                [
                    {
                        key: 'GPU',
                        value: renderProgress(gpu),
                        visible: Boolean(gpu?.usage || gpu?.effectiveGuaranteed),
                    },
                    {key: 'CPU', value: renderProgress(cpu)},
                    {
                        key: 'RAM',
                        value: renderProgress(user_memory, 'Bytes'),
                    },
                ],
            ] as Array<Array<MetaTableItem>>,
            subTitles: [
                i18n('general'),
                i18n('meta_usage') + ' / ' + i18n('meta_strong-guarantees'),
            ],
        };

        const type = mainResource === 'memory' ? 'user_memory' : (mainResource ?? 'cpu');
        const {accumulated_resource_volume, integral_pool_capacity} = pool?.attributes ?? {};
        const {[type]: capacity = NaN} = integral_pool_capacity ?? {};

        if (capacity >= 0 || burstUnit.length || flowUnit.length) {
            const {[type]: accumulated = NaN} = accumulated_resource_volume ?? {};

            const formatFn = (v: number) => {
                switch (type) {
                    case 'user_memory':
                        return format.Bytes(v) + '*hours';
                    case 'cpu':
                    case 'gpu':
                        return format.NumberSmart(v) + ' CPU*hours';
                    case 'user_slots':
                        return format.NumberSmart(v) + ' Slot*hours';
                }
            };

            res.items.push([
                {key: i18n('guarantee-type'), value: guaranteeType},
                {
                    key: i18n('capacity'),
                    value: (
                        <Tooltip
                            content={
                                <MetaTable
                                    items={[
                                        {
                                            key: 'accumulated_resource_volume',
                                            value: formatFn(accumulated / 3600),
                                        },
                                        {
                                            key: 'integral_pool_capacity',
                                            value: formatFn(capacity / 3600),
                                        },
                                    ]}
                                />
                            }
                        >
                            <ChargeLevel value={(accumulated / capacity) * 100} />
                        </Tooltip>
                    ),
                    visible: capacity >= 0,
                },
                {key: i18n('burst'), value: burstUnit, visible: burstUnit.length > 0},
                {key: i18n('flow'), value: flowUnit, visible: flowUnit.length > 0},
            ]);
            res.subTitles.push(i18n('integral-guarantees'));
        }
        return res;
    }, [pool, guarantees, mainResource]);

    if (!pool?.name || pool?.name === ROOT_POOL_NAME) {
        return null;
    }

    return (
        <CollapsibleSection className={block()} name={pool.name}>
            <MetaTable items={items} subTitles={subTitles} />
        </CollapsibleSection>
    );
}

function renderProgress(
    {
        usage,
        min,
        effectiveGuaranteed,
    }: {usage?: number; min?: number; effectiveGuaranteed?: number} = {},
    fmt?: 'Bytes',
) {
    const formatFn = format[fmt] ?? format.NumberSmart;

    const progressProps = calcProgressProps2({
        usage,
        limit: effectiveGuaranteed,
        format: fmt,
        themeThresholds: [{theme: 'success', max: Number.POSITIVE_INFINITY}],
        usageOverdraftTheme: 'warning',
    });

    const usageGreaterThanEffective = usage! > (effectiveGuaranteed ?? 0);
    const effectiveGuaranteeIsReduced = effectiveGuaranteed! < min!;
    const effectiveIsAutocalculated = effectiveGuaranteed! > (min ?? 0);

    return (
        <Tooltip
            content={
                <>
                    {usageGreaterThanEffective && (
                        <div className={block('tooltip-warning-top')}>
                            <YTText color="warning">
                                {i18n('meta_usage-is-greater-than-effective')}
                            </YTText>
                        </div>
                    )}

                    {effectiveIsAutocalculated && (
                        <div className={block('tooltip-warning-top')}>
                            <YTText color="secondary">
                                {i18n('meta_effective-is-autocalculated')}
                            </YTText>
                        </div>
                    )}

                    <MetaTable
                        items={[
                            {key: i18n('meta_usage'), value: formatFn(usage)},
                            {
                                key: i18n('meta_effective-guarantee'),
                                value: formatFn(effectiveGuaranteed),
                            },
                            {
                                key: i18n('meta_configured-guarantee'),
                                value: min ? formatFn(min) : format.NO_VALUE,
                            },
                        ]}
                    />

                    {effectiveGuaranteeIsReduced && (
                        <div className={block('tooltip-warning-bottom')}>
                            <YTText color="warning">
                                {i18n('meta_effective-less-than-strong-warning')}
                            </YTText>
                        </div>
                    )}
                </>
            }
        >
            <Flex alignItems="center" gap={1}>
                <Progress className={block('progress')} {...progressProps} />
                {usageGreaterThanEffective || effectiveGuaranteeIsReduced ? (
                    <Icon className={block('warning')} data={TriangleExclamation} />
                ) : effectiveIsAutocalculated ? (
                    <Icon className={block('secondary')} data={CircleInfo} />
                ) : null}
            </Flex>
        </Tooltip>
    );
}

function renderOperationsProgress(
    pool: PoolData<'pool'> | undefined,
    progressType: 'running' | 'total',
) {
    if (!pool) {
        return null;
    }

    const {
        operationCount: count = NaN,
        maxOperationCount: maxCount = NaN,
        runningOperationCount: running = NaN,
        maxRunningOperationCount: maxRunning = NaN,
        lightweightRunningOperationCount: lightweightRunning = NaN,
    } = pool;

    const pending = count - running - lightweightRunning;

    const runningStr = format.Number(running);
    const pendingStr = format.Number(pending);
    const maxRunningStr = format.Number(maxRunning);
    const maxCountStr = format.Number(maxCount);
    const lightweightStr = format.Number(lightweightRunning);

    const runningText = `${runningStr} / ${maxRunningStr}`;
    const totalText = `${runningStr} + ${lightweightStr} + ${pendingStr} / ${maxCountStr}`;

    return (
        <Tooltip
            className={block('progress', {operation: true})}
            content={
                <MetaTable
                    items={
                        progressType === 'running'
                            ? [
                                  {
                                      key: i18n('operations-running-max'),
                                      value: maxRunningStr,
                                  },
                                  {
                                      key: 'operations-running',
                                      label: (
                                          <span className={block('progress-meta-subitem')}>
                                              <ColorCircle
                                                  marginRight
                                                  color="var(--success-color)"
                                              />
                                              {i18n('operations-running')}
                                          </span>
                                      ),
                                      value: runningStr,
                                  },
                              ]
                            : [
                                  {
                                      key: i18n('operation-count-max'),
                                      value: maxCountStr,
                                  },
                                  {
                                      key: 'operations-running',
                                      label: (
                                          <span className={block('progress-meta-subitem')}>
                                              <ColorCircle
                                                  marginRight
                                                  color="var(--success-color)"
                                              />
                                              {i18n('operations-running')}
                                          </span>
                                      ),
                                      value: runningStr,
                                  },
                                  {
                                      key: 'lightweigh',
                                      label: (
                                          <span className={block('progress-meta-subitem')}>
                                              <ColorCircle
                                                  marginRight
                                                  color="var(--default-color)"
                                              />
                                              {i18n('operations-running-lightweigh')}
                                          </span>
                                      ),
                                      value: lightweightStr,
                                  },
                                  {
                                      key: 'pending',
                                      label: (
                                          <span className={block('progress-meta-subitem')}>
                                              <ColorCircle marginRight color="var(--info-color)" />
                                              {i18n('operations-pending')}
                                          </span>
                                      ),
                                      value: pendingStr,
                                  },
                              ]
                    }
                />
            }
        >
            {progressType === 'running' ? (
                <Progress
                    className={block('progress-control', {left: true})}
                    stack={addProgressStackSpacers([
                        {
                            value: (running / maxRunning) * 100,
                            theme: 'success',
                        },
                    ])}
                    text={runningText}
                />
            ) : (
                <Progress
                    className={block('progress-control', {right: true})}
                    stack={addProgressStackSpacers([
                        {
                            value: (running / maxCount) * 100,
                            theme: 'success',
                        },
                        {
                            value: (lightweightRunning / maxCount) * 100,
                            theme: 'default',
                        },
                        {
                            value: (pending / maxCount) * 100,
                            theme: 'info',
                        },
                    ])}
                    text={totalText}
                />
            )}
        </Tooltip>
    );
}

function formatUnits(item?: PoolStaticConfigurationItem) {
    const {gpu, cpu, memory} = item ?? {};
    return [
        gpu! > 0 && `${format.Number(gpu)} GPU`,
        cpu! > 0 && `${format.Number(cpu)} CPU`,
        memory! > 0 && `${format.Bytes(memory)} RAM`,
    ]
        .filter(Boolean)
        .join(', ');
}
