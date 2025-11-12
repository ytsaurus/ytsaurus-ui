import cn from 'bem-cn-lite';
import React from 'react';
import {useSelector} from 'react-redux';

import {Progress} from '@gravity-ui/uikit';

import format from '../../../../../common/hammer/format';

import CollapsibleSection from '../../../../../components/CollapsibleSection/CollapsibleSection';
import {ColorCircle} from '../../../../../components/ColorCircle/ColorCircle';
import MetaTable, {MetaTableItem} from '../../../../../components/MetaTable/MetaTable';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {ROOT_POOL_NAME} from '../../../../../constants/scheduling';
import {getCurrentPool} from '../../../../../store/selectors/scheduling/scheduling';
import {
    PoolStaticConfigurationItem,
    getCurrentPoolGuarantees,
} from '../../../../../store/selectors/scheduling/scheduling-ts';
import {addProgressStackSpacers} from '../../../../../utils/progress';
import {PoolData} from '../../../../../utils/scheduling/pool-child';
import {calcProgressProps} from '../../../../../utils/utils';

import i18n from './i18n';

import './SchedulingMeta.scss';

const block = cn('yt-scheduling-meta');

export function SchedulingMeta() {
    const pool = useSelector(getCurrentPool);

    const guarantees = useSelector(getCurrentPoolGuarantees);

    const {items, subTitles} = React.useMemo(() => {
        const {mode, resources, integralType, flowCPU = 0, flowGPU = 0, weight} = pool ?? {};
        const {cpu, gpu, user_memory} = resources ?? {};
        const hasStrong = cpu?.min! > 0 || gpu?.min! > 0 || user_memory?.min! > 0;

        const hasIntegralType =
            (integralType && integralType !== 'none') || flowCPU > 0 || flowGPU > 0;

        const guaranteeType = [
            hasStrong && 'Strong',
            hasIntegralType && format.ReadableField(integralType),
        ]
            .filter(Boolean)
            .join(' / ');

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
                        value: renderProgress(gpu?.usage, gpu?.min),
                        visible: Boolean(gpu?.usage || gpu?.min),
                    },
                    {key: 'CPU', value: renderProgress(cpu?.usage, cpu?.min)},
                    {
                        key: 'RAM',
                        value: renderProgress(user_memory?.usage, user_memory?.min, 'Bytes'),
                    },
                ],
            ] as Array<Array<MetaTableItem>>,
            subTitles: [i18n('general'), i18n('strong-guarantees')],
        };

        if (hasIntegralType) {
            res.items.push([
                {key: i18n('guarantee-type'), value: guaranteeType},
                {key: i18n('integral-guarantee'), value: '??? ОТКУДА БРАТЬ ЗНАЧЕНИЯ ???'},
                {key: i18n('burst-unit'), value: burstUnit, visible: burstUnit.length > 0},
                {key: i18n('flow-unit'), value: flowUnit, visible: flowUnit.length > 0},
            ]);
            res.subTitles.push(i18n('integral-guarantees'));
        }
        return res;
    }, [pool, guarantees]);

    if (!pool?.name || pool?.name === ROOT_POOL_NAME) {
        return null;
    }

    return (
        <CollapsibleSection
            className={block()}
            name={i18n('pool-configuration', {pool_name: pool.name})}
        >
            <MetaTable items={items} subTitles={subTitles} />
        </CollapsibleSection>
    );
}

function renderProgress(usage?: number, limit?: number, format?: 'Bytes') {
    return (
        <Progress
            className={block('progress')}
            {...Object.assign(calcProgressProps(usage, limit, format))}
            theme="success"
        />
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
