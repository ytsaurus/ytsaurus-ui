import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {Column} from '@gravity-ui/react-data-table';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {getIsRoot, getTree} from '../../../store/selectors/scheduling/scheduling';
import {getCurrentPoolTreeStaticConfiguration} from '../../../store/selectors/scheduling/scheduling-ts';

import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import format from '../../../common/hammer/format';

import './SchedulingStaticConfiguration.scss';
import {getSettingsSchedulingExpandStaticConfiguration} from '../../../store/selectors/settings/settings-ts';
import {setSettingsSchedulingExpandStaticConfiguration} from '../../../store/actions/settings/settings';
import UIFactory from '../../../UIFactory';
import {getCluster} from '../../../store/selectors/global';
import {ArrayElement} from '../../../types';

const block = cn('scheduling-static-configuration');

function SchedulingStaticConfiguration() {
    const dispatch = useDispatch();
    const isRoot = useSelector(getIsRoot);

    const collapsed = useSelector(getSettingsSchedulingExpandStaticConfiguration);
    const onToggle = React.useCallback(
        (value: boolean) => {
            dispatch(setSettingsSchedulingExpandStaticConfiguration(value));
        },
        [dispatch],
    );

    return isRoot ? (
        <CollapsibleSection
            name={'Static configuration'}
            className={block()}
            onToggle={onToggle}
            collapsed={collapsed}
        >
            <div className={block('container')}>
                <PoolTreeStaticConfiguration />
            </div>
        </CollapsibleSection>
    ) : null;
}

export default React.memo(SchedulingStaticConfiguration);

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
