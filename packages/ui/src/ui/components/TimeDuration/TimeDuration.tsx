import React from 'react';
import moment from 'moment';
import cn from 'bem-cn-lite';

import {
    NumberInputWithError,
    NumberInputWithErrorProps,
} from '../../components/NumberInput/NumberInput';
import {MetaTable, Tooltip} from '@ytsaurus/components';
import Icon from '../../components/Icon/Icon';

import i18n from './i18n';

import './TimeDuration.scss';

const block = cn('yt-time-duration');

export type TimeDurationProps = {
    className?: string;

    value: NumberInputWithErrorProps['value'];
    error?: string;
    onChange: (value: TimeDurationProps['value']) => void;
};

export function TimeDuration({value, onChange, error}: TimeDurationProps) {
    return (
        <div className={block()}>
            <NumberInputWithError
                className={block('input')}
                value={{...value, value: value?.value, error: value?.error ?? error}}
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
                                    y: i18n('value_years'),
                                    w: i18n('value_weeks'),
                                    M: i18n('value_months'),
                                    d: i18n('value_days'),
                                }),
                                makeItems({
                                    h: i18n('value_hours'),
                                    m: i18n('value_minutes'),
                                    s: i18n('value_seconds'),
                                    ms: i18n('value_milliseconds'),
                                }),
                            ]}
                        />
                        {i18n('context_month-note')}
                        <br />
                        <br />
                        {i18n('context_examples')}
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

TimeDuration.validator = (v: TimeDurationProps['value']) => {
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
        ms: 1,
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

    if (!/^[\d\sa-zA-Z]*$/.test(rawValue)) {
        return {value: undefined, error: i18n('alert_only-digits-and-latin')};
    }

    const skipSpaces = rawValue.replace(/\s+/g, '');
    const res = [...skipSpaces.matchAll(/\d+[a-zA-Z]*/g)];
    if (!res.length || res[0].index !== 0) {
        return {value: undefined, error: i18n('alert_wrong-format')};
    }

    let value = 0;
    for (const match of res) {
        const {[0]: digits, input} = match[0].match(/\d+/) || {};
        if (!digits) {
            return {value: undefined, error: i18n('alert_wrong-format')};
        }

        const type = input?.substring(digits.length) ?? '';
        const d = Number(digits);
        const toAdd = moment.duration(d, type as any).valueOf() as number;
        if (toAdd === 0 && d !== 0) {
            return {value: undefined, error: i18n('alert_wrong-format')};
        }

        value += toAdd;
    }
    return {value};
}

function makeItems(data: Record<string, string>) {
    return Object.keys(data).map((key) => ({key, label: key, value: data[key]}));
}
