import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Column} from '@gravity-ui/react-data-table';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {getIsRoot, getTree} from '../../../store/selectors/scheduling/scheduling';
import {
    getCurrentPoolStaticConfiguration,
    getCurrentPoolTreeStaticConfiguration,
} from '../../../store/selectors/scheduling/scheduling-ts';

import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import format from '../../../common/hammer/format';

import './SchedulingStaticConfiguration.scss';
import {getSettingsSchedulingExpandStaticConfiguration} from '../../../store/selectors/settings-ts';
import {setSettingsSchedulingExpandStaticConfiguration} from '../../../store/actions/settings/settings';
import Label from '../../../components/Label/Label';
import UIFactory from '../../../UIFactory';
import PoolMetaData from '../Content/PoolMetaData';
import {getCluster} from '../../../store/selectors/global';
import {ArrayElement} from '../../../types';

const block = cn('scheduling-static-configuration');

interface Props {
    onToggleCollapsedState: (value: boolean) => void;
}

function SchedulingStaticConfiguration(props: Props) {
    const {onToggleCollapsedState} = props;
    const dispatch = useDispatch();
    const isRoot = useSelector(getIsRoot);

    const collapsed = useSelector(getSettingsSchedulingExpandStaticConfiguration);
    const onToggle = React.useCallback(
        (value: boolean) => {
            onToggleCollapsedState(value);
            dispatch(setSettingsSchedulingExpandStaticConfiguration(value));
        },
        [onToggleCollapsedState, dispatch],
    );

    return (
        <CollapsibleSection
            name={'Static configuration'}
            className={block()}
            onToggle={onToggle}
            collapsed={collapsed}
        >
            <div className={block('container')}>
                <PoolMetaData className={block('pool-meta')} />
                {isRoot ? <PoolTreeStaticConfiguration /> : <PoolStaticConfiguration />}
            </div>
        </CollapsibleSection>
    );
}

export default React.memo(SchedulingStaticConfiguration);

function PoolStaticConfiguration() {
    const staticConfigurationItems = useSelector(getCurrentPoolStaticConfiguration);

    const columns: Array<Column<ArrayElement<typeof staticConfigurationItems>>> = [
        {
            name: 'name',
            header: 'Guarantees',
            sortable: false,
            width: 200,
        },
        {
            name: 'cpu',
            header: 'CPU',
            sortable: false,
            width: 100,
            render: ({row}) => {
                const {cpu, cpuLabel} = row;
                if (cpuLabel) {
                    return <Label capitalize text={cpuLabel} />;
                }
                return format['Number'](cpu);
            },
            align: 'right',
        },
        {
            name: 'gpu',
            header: 'GPU',
            sortable: false,
            width: 100,
            render: ({row}) => {
                return format['Number'](row.gpu);
            },
            align: 'right',
        },
        {
            name: 'memory',
            header: 'Memory',
            sortable: false,
            width: 120,
            render: ({row}) => {
                return format['Bytes'](row.memory);
            },
            align: 'right',
        },
        {
            name: 'user_slots',
            header: 'User slots',
            sortable: false,
            width: 100,
            render: ({row}) => {
                return format['Number'](row.user_slots);
            },
            align: 'right',
        },
        {
            name: 'network',
            header: 'Network',
            sortable: false,
            width: 100,
            render: ({row}) => {
                const res = format['Number'](row.network);
                return res === format.NO_VALUE ? res : res + ' %';
            },
            align: 'right',
        },
    ];

    return (
        <DataTableYT
            className={block('table')}
            columns={columns}
            data={staticConfigurationItems}
            useThemeYT={true}
            settings={{
                displayIndices: false,
            }}
        />
    );
}

function PoolTreeStaticConfiguration() {
    const items = useSelector(getCurrentPoolTreeStaticConfiguration);
    const poolTree = useSelector(getTree);
    const cluster = useSelector(getCluster);

    const columns: Array<Column<ArrayElement<typeof items>>> = [
        {
            name: 'name',
            header: '',
            sortable: false,
            width: 200,
            render: (row) => {
                const {name, level} = row?.row || {};
                return <span className={block('name', {level: level as any})}>{name}</span>;
            },
        },
        {
            name: 'total',
            header: 'Total',
            sortable: false,
            width: 100,
            render: ({row}) => {
                return format[row.format](row.total);
            },
            align: 'right',
        },
        {
            name: 'used',
            header: 'Distributed',
            sortable: false,
            width: 150,
            render({row}) {
                const {used, usedTitle, lastDayMaxValueSensor, lastDayMaxValueTitle} = row;
                const formatValue = format[row.format];

                const content = !lastDayMaxValueSensor
                    ? null
                    : UIFactory.renderSchedulingLastDayMaximum({
                          cluster,
                          tree: poolTree,
                          title: lastDayMaxValueTitle,
                          sensor: lastDayMaxValueSensor,
                          format: formatValue,
                          current: {
                              value: formatValue(used),
                              title: usedTitle!,
                          },
                          showHint: true,
                          showAsLink: true,
                      });

                return !content ? (
                    formatValue(used)
                ) : (
                    <span className={block('used-cell')}>
                        {formatValue(used)} / {content}
                    </span>
                );
            },
            align: 'right',
        },
        {
            name: 'free',
            header: 'Delta',
            sortable: false,
            width: 150,
            render({row}) {
                const formatFn = format[row.format];
                const {free, total, lastDayMaxValueSensor} = row;
                const freeValue = formatFn(free);

                const content = !lastDayMaxValueSensor
                    ? null
                    : UIFactory.renderSchedulingLastDayMaximum({
                          cluster,
                          tree: poolTree,
                          title: 'Last day max operations',
                          sensor: lastDayMaxValueSensor,
                          format: (lastDayMaxValue?: number) => {
                              const v =
                                  isNaN(total!) || isNaN(lastDayMaxValue!)
                                      ? undefined
                                      : total! - lastDayMaxValue!;
                              return formatFn(v);
                          },
                      });

                return !content ? (
                    freeValue
                ) : (
                    <span>
                        {freeValue} / {content}
                    </span>
                );
            },
            align: 'right',
        },
    ];

    return (
        <DataTableYT
            className={block('table')}
            columns={columns}
            data={items}
            useThemeYT={true}
            settings={{
                displayIndices: false,
            }}
            rowClassName={(row) => {
                return !row?.level ? '' : block('row', {level: row.level as any});
            }}
        />
    );
}
