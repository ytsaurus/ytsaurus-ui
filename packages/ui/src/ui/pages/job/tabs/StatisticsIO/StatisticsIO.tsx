import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {createSelector} from 'reselect';
import cn from 'bem-cn-lite';

import compact_ from 'lodash/compact';
import isFinite_ from 'lodash/isFinite';

import MetaTable from '../../../../components/MetaTable/MetaTable';
import ElementsTableRaw from '../../../../components/ElementsTable/ElementsTable';

import hammer from '../../../../common/hammer';
import {StatisticsIO as IStatisticsIO} from '../../../../types/job';
import {
    getAverageGpuMemory,
    getAverageGpuPower,
    getAverageGpuUtilization,
    getAverageUserCpuTime,
    getAverageWaitCpuTime,
    getGpuDevices,
    getJobStatisticsIO,
    getTotalTimeIO,
} from '../../../../store/selectors/job/detail';

import './StatisticsIO.scss';

const block = cn('job-statistics-io');
const headingBlock = cn('elements-heading');
const ElementsTable: any = ElementsTableRaw;

const getTableColumns = () => {
    return {
        items: {
            table: {
                caption: 'Table',
                align: 'left',
            },
            busy_time: {
                caption: 'Busy time',
                align: 'right',
            },
            bytes: {
                caption: 'Bytes',
                align: 'right',
            },
            idle_time: {
                caption: 'Idle time',
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
        getTotalTimeIO,
        getAverageUserCpuTime,
        getAverageWaitCpuTime,
        getGpuDevices,
        getAverageGpuUtilization,
        getAverageGpuPower,
        getAverageGpuMemory,
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
            {key: 'total time waiting to read data', value: hammer.format['TimeDuration'](read)},
            {key: 'total time waiting to write data', value: hammer.format['TimeDuration'](write)},
            isFinite_(averageUserCpuTime) && {
                key: 'average user cpu time per second',
                value: hammer.format['Number'](averageUserCpuTime, {digits: 3}),
            },
            isFinite_(averageWaitCpuTime) && {
                key: 'average wait cpu time per second',
                value: hammer.format['Number'](averageWaitCpuTime, {digits: 3}),
            },
            {key: 'gpu devices', value: hammer.format['Number'](gpuDevices)},
            isFinite_(averageGpuUtilization) && {
                key: 'average gpu utilization',
                value: hammer.format['Percent'](averageGpuUtilization * 100),
            },
            isFinite_(averageGpuPower) && {
                key: 'average gpu power',
                value: hammer.format['Number'](averageGpuPower, {digits: 3}),
            },
            isFinite_(averageGpuMemory) && {
                key: 'average gpu memory usage',
                value: hammer.format['Bytes'](averageGpuMemory),
            },
        ]),
);

export default function StatisticsIO() {
    const {input, output} = useSelector(getJobStatisticsIO);
    const items = useSelector(selectItems);

    const columns = useMemo(getTableColumns, []);
    const templates = useMemo(() => getTableTemplates(), []);

    return (
        <div className={block()}>
            <MetaTable className={block('meta')} items={items} />

            <div className={headingBlock({size: 'm'}, block('heading'))}>Input</div>
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
                    <div className={headingBlock({size: 'm'}, block('heading'))}>Output</div>
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
