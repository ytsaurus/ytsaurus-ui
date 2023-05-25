import React from 'react';
import moment from 'moment';
import cn from 'bem-cn-lite';

import {
    NumberInputWithError,
    NumberInputWithErrorProps,
} from '../../components/NumberInput/NumberInput';
import {Tooltip} from '../../components/Tooltip/Tooltip';
import MetaTable from '../../components/MetaTable/MetaTable';
import Icon from '../../components/Icon/Icon';

import './TimeDuration.scss';

const block = cn('yt-time-duration');

export type TimeDurationProps = {
    className?: string;

    value: NumberInputWithErrorProps['value'];
    onChange: (value: TimeDurationProps['value']) => void;
};

export function TimeDuration({value, onChange}: TimeDurationProps) {
    return (
        <div className={block()}>
            <NumberInputWithError
                className={block('input')}
                value={value}
                onChange={onChange}
                formatFn={formatTimeDuration}
                parseFn={parseTimeDuration}
            />
            <Tooltip
                content={
                    <div>
                        <MetaTable
                            items={[
                                makeItems({
                                    y: 'years',
                                    w: 'weeks',
                                    M: 'months',
                                    d: 'days',
                                }),
                                makeItems({
                                    h: 'hours',
                                    m: 'minutes',
                                    s: 'seconds',
                                    ms: 'milliseconds',
                                }),
                            ]}
                        />
                        Examles: 1M2d3h, 4h15m
                    </div>
                }
            >
                <Icon className={block('info')} awesome={'question-circle'} />
            </Tooltip>
        </div>
    );
}

TimeDuration.hasErrorRenderer = true;

TimeDuration.getDefaultValue = (): TimeDurationProps['value'] => {
    return {value: undefined};
};

TimeDuration.isEmpty = (v: TimeDurationProps['value']) => {
    return !v;
};

TimeDuration.validate = (v: TimeDurationProps['value']) => {
    return v?.error;
};

export function formatTimeDuration(value?: number) {
    if (!value && value !== 0) {
        return '';
    }

    let rest = value;
    let res = '';

    const h = 3600 * 1000;
    const d = 24 * h;
    const M = 30 * d;
    const y = 365 * d;

    const parts = {
        y,
        M,
        d,
        h,
        m: 60 * 1000,
        s: 1000,
        ['']: 1,
    };

    Object.keys(parts).forEach((k) => {
        const p: number = parts[k as keyof typeof parts];
        const count = Math.floor(rest / p);
        if (count > 0) {
            res += `${count}${k} `;
            rest -= count * p;
        }
    });

    return res;
}

export function parseTimeDuration(rawValue: string) {
    if (!rawValue) {
        return {value: undefined};
    }
    const skipSpaces = rawValue.replace(/\s+/g, '');
    const res = [...skipSpaces.matchAll(/\d+[a-zA-Z]*/g)];
    if (!res.length || res[0].index !== 0) {
        return {value: undefined, error: 'wrong format'};
    }

    let value = 0;
    for (const match of res) {
        const {[0]: digits, input} = match[0].match(/\d+/) || {};
        if (!digits) {
            return {value: undefined, error: 'wring fromat 1'};
        }

        const type = input?.substring(digits.length) ?? '';
        const d = Number(digits);
        const toAdd = moment.duration(d, type as any).valueOf() as number;
        if (toAdd === 0 && d !== 0) {
            return {value: undefined, error: `wrong format of ${input}`};
        }

        value += toAdd;
    }
    return {value};
}

function makeItems(data: Record<string, string>) {
    return Object.keys(data).map((key) => ({key: key, label: key, value: data[key]}));
}
