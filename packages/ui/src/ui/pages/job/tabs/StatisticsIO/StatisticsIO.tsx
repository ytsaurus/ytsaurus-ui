import React, {useMemo} from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {createSelector} from 'reselect';
import cn from 'bem-cn-lite';

import compact_ from 'lodash/compact';
import isFinite_ from 'lodash/isFinite';

import {MetaTable} from '@ytsaurus/components';
import ElementsTableRaw from '../../../../components/ElementsTable/ElementsTable';

import hammer from '../../../../common/hammer';
import {type StatisticsIO as IStatisticsIO} from '../../../../types/operations/job';
import {
    selectAverageGpuMemory,
    selectAverageGpuPower,
    selectAverageGpuUtilization,
    selectAverageUserCpuTime,
    selectAverageWaitCpuTime,
    selectGpuDevices,
    selectJobStatisticsIO,
    selectTotalTimeIO,
} from '../../../../store/selectors/job/detail';

import i18n from './i18n';
import './StatisticsIO.scss';

const block = cn('job-statistics-io');
const headingBlock = cn('elements-heading');
const ElementsTable: any = ElementsTableRaw;

const getTableColumns = () => {
    return {
        items: {
            table: {
                caption: i18n('field_table'),
                align: 'left',
            },
            busy_time: {
                caption: i18n('field_busy-time'),
                align: 'right',
            },
            bytes: {
                caption: i18n('field_bytes'),
                align: 'right',
            },
            idle_time: {
                caption: i18n('field_idle-time'),
                align: 'right',
            },
        },
        sets: {
            default: {
                items: ['table', 'busy_time', 'bytes', 'idle_time'],
            },
        },
        mode: 'default',
    };
};

const getTableTemplates = () => {
    const prepareStatistic = (item: Record<string, any>, key: string): string => {
        return hammer.format[key === 'bytes' ? 'Bytes' : 'TimeDuration'](item[key]);
    };

    return {
        busy_time(item: IStatisticsIO) {
            return prepareStatistic(item, 'busy_time');
        },
        bytes(item: IStatisticsIO) {
            return prepareStatistic(item, 'bytes');
        },
        idle_time(item: IStatisticsIO) {
            return prepareStatistic(item, 'idle_time');
        },
    };
};

const selectItems = createSelector(
    [
        selectTotalTimeIO,
        selectAverageUserCpuTime,
        selectAverageWaitCpuTime,
        selectGpuDevices,
        selectAverageGpuUtilization,
        selectAverageGpuPower,
        selectAverageGpuMemory,
    ],
    (
        {read, write},
        averageUserCpuTime,
        averageWaitCpuTime,
        gpuDevices,
        averageGpuUtilization,
        averageGpuPower,
        averageGpuMemory,
    ) =>
        compact_([
            {key: i18n('field_total-time-read'), value: hammer.format['TimeDuration'](read)},
            {key: i18n('field_total-time-write'), value: hammer.format['TimeDuration'](write)},
            isFinite_(averageUserCpuTime) && {
                key: i18n('field_average-user-cpu-time'),
                value: hammer.format['Number'](averageUserCpuTime, {digits: 3}),
            },
            isFinite_(averageWaitCpuTime) && {
                key: i18n('field_average-wait-cpu-time'),
                value: hammer.format['Number'](averageWaitCpuTime, {digits: 3}),
            },
            {key: i18n('field_gpu-devices'), value: hammer.format['Number'](gpuDevices)},
            isFinite_(averageGpuUtilization) && {
                key: i18n('field_average-gpu-utilization'),
                value: hammer.format['Percent'](averageGpuUtilization * 100),
            },
            isFinite_(averageGpuPower) && {
                key: i18n('field_average-gpu-power'),
                value: hammer.format['Number'](averageGpuPower, {digits: 3}),
            },
            isFinite_(averageGpuMemory) && {
                key: i18n('field_average-gpu-memory'),
                value: hammer.format['Bytes'](averageGpuMemory),
            },
        ]),
);

export default function StatisticsIO() {
    const {input, output} = useSelector(selectJobStatisticsIO);
    const items = useSelector(selectItems);

    const columns = useMemo(getTableColumns, []);
    const templates = useMemo(() => getTableTemplates(), []);

    return (
        <div className={block()}>
            <MetaTable className={block('meta')} items={items} />

            <div className={headingBlock({size: 'm'}, block('heading'))}>{i18n('title_input')}</div>
            <ElementsTable
                size="s"
                theme="light"
                css={block()}
                items={input}
                virtual={false}
                striped={false}
                columns={columns}
                templates={templates}
            />

            {output.length > 0 && (
                <React.Fragment>
                    <div className={headingBlock({size: 'm'}, block('heading'))}>
                        {i18n('title_output')}
                    </div>
                    <ElementsTable
                        size="s"
                        theme="light"
                        css={block()}
                        items={output}
                        virtual={false}
                        striped={false}
                        columns={columns}
                        templates={templates}
                        rowClassName={({isTotal}: {isTotal?: boolean}) => {
                            return isTotal ? block('row-total') : undefined;
                        }}
                    />
                </React.Fragment>
            )}
        </div>
    );
}
