import React from 'react';
import cn from 'bem-cn-lite';
import min from 'lodash/min';
import max from 'lodash/max';

import './VisibleValues.scss';

const block = cn('yt-visible-values');

export type VisbileValuesProps = {
    className?: string;
    value: Array<string>;
    maxVisibleValues?: number;
    maxTextLength?: number;
    renderItem?: (item: VisbileValuesProps['value'][number], index: number) => React.ReactNode;

    width?: 'max';
    counter?: 'all-values' | 'missing-values' | 'none';
};

export function VisibleValues({
    className,
    value,
    maxVisibleValues,
    maxTextLength,
    renderItem = (value) => value,
    counter,
}: VisbileValuesProps) {
    const visibleItems = React.useMemo(() => {
        const maxCounts = [maxVisibleValues];
        if (maxTextLength !== undefined) {
            let i = 1;
            let sum = value[0].length;
            for (; i < value?.length; ++i) {
                const newSum = sum + value[i].length;
                if (newSum < maxTextLength) {
                    sum = newSum;
                } else {
                    break;
                }
            }
            maxCounts.push(i);
        }
        const visibleCount = min(maxCounts);
        return value.slice(0, max([1, visibleCount]));
    }, [value, maxTextLength, maxVisibleValues]);

    const hasMissing = value.length > visibleItems.length;
    const hideSpacer = counter === 'missing-values';
    return (
        <div className={block(null, className)}>
            <span className={block('values')}>
                {visibleItems.map((option, index) => {
                    return (
                        <span key={index} className={block('values-item')}>
                            {index !== 0 && <>,&nbsp;</>}
                            {renderItem(option, index)}
                        </span>
                    );
                })}
            </span>
            {!hideSpacer && (
                <span className={block('spacer', {missing: hasMissing})}>
                    {hasMissing && ', ...'}
                </span>
            )}
            <SelectedCount count={value.length} visibleCount={visibleItems.length} mode={counter} />
        </div>
    );
}

function SelectedCount({
    count = 0,
    visibleCount = 0,
    mode,
}: {
    count?: number;
    visibleCount?: number;
    mode: VisbileValuesProps['counter'];
}) {
    if (mode === 'none') {
        return null;
    }

    if (visibleCount === count && mode === 'missing-values') {
        return null;
    }

    const value = mode === 'missing-values' ? count - visibleCount : count;

    return value! >= 2 ? (
        <div className={block('counter')}>
            <span className={block('counter-value')}>
                {mode === 'missing-values' ? '+' : null}
                {value}
            </span>
        </div>
    ) : null;
}
