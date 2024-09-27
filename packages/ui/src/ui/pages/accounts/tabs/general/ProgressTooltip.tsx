import React from 'react';

import isNumber_ from 'lodash/isNumber';
import reduce_ from 'lodash/reduce';

import cn from 'bem-cn-lite';

import Icon from '../../../../components/Icon/Icon';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';

import './ProgressTooltip.scss';

const block = cn('yt-progress-tooltip');

interface Props {
    info: Array<ProgressInfo>;
    limit: number;
    formatNumber?: (v: number) => string;
}

interface ProgressInfo<T = number> {
    name: string;
    committed: T;
    limit: T;
    color?: string;
}

export function ProgressTooltip({info, limit, formatNumber}: Props) {
    return (
        <ErrorBoundary>
            <div className={block()}>
                <ProgressTooltipRow<string>
                    mixin={block('header')}
                    name="Account name"
                    committed="Usage"
                    limit="Limit"
                />
                <ProgressTooltipTotalRow mixin={block('total')} {...{info, limit, formatNumber}} />
                {info.map((i, index) => {
                    return <ProgressTooltipRow key={index} {...i} formatNumber={formatNumber} />;
                })}
            </div>
        </ErrorBoundary>
    );
}

interface ProgressTooltipRowProps<T extends number | string>
    extends ProgressInfo<T>,
        Pick<Props, 'formatNumber'> {
    mixin?: string;
}

function ProgressTooltipRow<T extends number | string>({
    name,
    committed,
    limit,
    color,
    mixin,
    formatNumber,
}: ProgressTooltipRowProps<T>) {
    const icon =
        color !== undefined ? (
            <span style={{color}}>
                <Icon awesome="circle" face="solid" />
            </span>
        ) : null;
    const committedValue =
        formatNumber && isNumber_(committed) ? formatNumber(committed) : committed;
    const limitValue = formatNumber && isNumber_(limit) ? formatNumber(limit) : limit;

    return (
        <React.Fragment>
            <span className={block('icon', mixin)}>{icon}</span>
            <span className={block('name', mixin)}>{name}</span>
            <div className={block('committed', mixin)}>{committedValue}</div>
            <div className={block('limit', mixin)}>{limitValue}</div>
        </React.Fragment>
    );
}

interface ProgressTooltipTotalRowProps extends Props {
    mixin?: string;
}

function ProgressTooltipTotalRow({info, limit, mixin, formatNumber}: ProgressTooltipTotalRowProps) {
    const committed = reduce_(info, (acc, item) => acc + item.committed, 0);
    return <ProgressTooltipRow name="Total" {...{formatNumber, mixin, committed, limit}} />;
}
