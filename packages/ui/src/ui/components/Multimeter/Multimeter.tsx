import React from 'react';
import cn from 'bem-cn-lite';

import hummerFormat from '../../common/hammer/format';
import type {TPerformanceCounters} from '../../store/reducers/navigation/tabs/queue/types';
import BarChart from './BarChart';
import {Tooltip} from '../Tooltip/Tooltip';
import MetaTable from '../MetaTable/MetaTable';

import './Multimeter.scss';

const block = cn('multimeter');

interface Props extends Partial<TPerformanceCounters> {
    show: keyof TPerformanceCounters;
    showTooltip?: boolean;
    format?: (value: number) => React.ReactNode;
}

const Multimeter: React.VFC<Props> = ({show, format, ...counters}) => {
    const formatter = format || hummerFormat.Number;

    const counterNames = ['1d', '1h', '1m'] as const;
    const content = (
        <MetaTable
            className={block('tooltip')}
            items={counterNames.map((key) => {
                return {key, value: formatter(counters[key] ?? 0)};
            })}
        />
    );

    return (
        <div className={block()}>
            <Tooltip content={content}>
                <BarChart values={counterNames.map((key) => counters[key] ?? 0)} />
            </Tooltip>
            <div className={block('value')}>{formatter(counters[show] ?? 0)}</div>
        </div>
    );
};

export default Multimeter;
