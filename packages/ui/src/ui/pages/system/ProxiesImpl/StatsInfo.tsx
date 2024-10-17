import {Progress, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';

import {addProgressStackSpacers} from '../../../utils/progress';
import Link from '../../../components/Link/Link';

import './StatsInfo.scss';

const block = cn('stats-info');

type Props = {
    status: 'ONLINE' | 'OFFLINE' | 'BANNED' | 'OTHER' | 'FULL';

    count: number;
    url?: string;

    alertsUrl?: string;
    alertCount?: number;

    decCount?: number;
    decUrl?: string;
};

const COLORS_BY_STATUS = {
    ONLINE: ['var(--success-color)', 'var(--success-text)', 'var(--default-color)'],
    OFFLINE: ['var(--danger-color)', 'var(--danger-text)', 'var(--default-color)'],
    BANNED: ['var(--warning-color)', 'var(--warning-text)', 'var(--default-color)'],
    OTHER: ['var(--info-color)', 'var(--info-text)', 'var(--default-color)'],
    FULL: [],
};

function calculateStack(status: Props['status'], count: number, alerts = 0, dec = 0) {
    if (!count) {
        return [];
    }

    const alertsValue = (alerts / count) * 100;

    const decValue = (dec / count) * 100;

    const remaining = 100 - alertsValue - decValue;

    const colors = COLORS_BY_STATUS[status];

    return addProgressStackSpacers([
        {
            value: remaining,
            color: colors[0],
        },
        {
            value: alertsValue,
            color: colors[1],
        },
        {
            value: decValue,
            color: colors[2],
        },
    ]);
}

export const StatsInfo = ({
    count,
    status,
    alertCount: alertNumber,
    decCount: decNumber,
    url,
    alertsUrl,
    decUrl,
}: Props) => {
    const stack = calculateStack(status, count, alertNumber, decNumber);

    return (
        <div className={block()}>
            <div>
                <CountUrl count={count} url={url} variant="body-2" />
            </div>
            <Text className={block('text')} variant="body-short" color="secondary">
                {status}
            </Text>
            <Progress className={block('progress')} stack={stack ?? []} size="xs" />

            <TextCountUrl text="ALERT" count={alertNumber} color="primary" url={alertsUrl} />
            <TextCountUrl text="DEC" count={decNumber} color="primary" url={decUrl} />
        </div>
    );
};

function TextCountUrl({
    count,
    url,
    text,
    color,
}: {
    count?: number;
    url?: string;
    text: string;
    color: 'warning' | 'primary';
}) {
    return (
        <div className={block('info', {hidden: count === undefined})}>
            <Text
                color={count !== 0 ? color : 'hint'}
                className={block('subtext')}
                variant="body-short"
            >
                {text}
            </Text>
            <CountUrl count={count} url={url} variant="body-short" />
        </div>
    );
}

function CountUrl({
    count,
    url,
    variant,
}: {
    count?: number;
    url?: string;
    variant: 'body-2' | 'body-short';
}) {
    return (
        <Text variant={variant ?? 'body-short'} color="hint">
            {url && count !== 0 ? (
                <Link theme="primary" className={block('link')} url={url}>
                    {count}
                </Link>
            ) : (
                count
            )}
        </Text>
    );
}
