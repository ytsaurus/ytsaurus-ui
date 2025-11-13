import sortedIndexBy_ from 'lodash/sortedIndexBy';
import type {ProgressProps, ProgressTheme} from '@gravity-ui/uikit';

import format from '../common/hammer/format';

export function computeProgress(usage: number | undefined, limit: number | undefined) {
    let progress;

    if (isNaN(usage!) || isNaN(limit!)) {
        return undefined;
    }

    if (limit! > 0) {
        progress = (usage! / limit!) * 100;
    } else {
        progress = usage! > 0 ? 100 : 0;
    }

    return Math.max(0, Math.min(progress, 100));
}

export function progressText(
    usage?: number,
    limit?: number,
    {
        type,
        digits,
        digitsOnlyForFloat,
    }: {type?: 'bytes'; digits?: number; digitsOnlyForFloat?: boolean} = {},
) {
    const formatFn = type === 'bytes' ? format.Bytes : format.Number;
    const settings = {digits, digitsOnlyForFloat};
    return `${formatFn(usage, settings)} / ${formatFn(limit, settings)}`;
}

export interface ThemeThreshold {
    theme: ProgressTheme;
    max: number;
}

export const defaultThemeThresholds: ThemeThreshold[] = [
    {theme: 'success', max: 90},
    {theme: 'warning', max: 95},
    {theme: 'danger', max: Number.POSITIVE_INFINITY},
];

export const accountsIoThroughputThresholds: ThemeThreshold[] = [
    {theme: 'success', max: 75},
    {theme: 'warning', max: 90},
    {theme: 'danger', max: Number.POSITIVE_INFINITY},
];

/**
 * @param progress Range [0; 100]
 * @param thresholds Sorted thresholds
 */
export function getProgressTheme(
    progress = 0,
    thresholds: ThemeThreshold[] = defaultThemeThresholds,
): ProgressTheme {
    const index = sortedIndexBy_(
        thresholds,
        {max: Number.isFinite(progress) ? progress : 0} as ThemeThreshold,
        'max',
    );

    return thresholds[index].theme;
}

export function addProgressStackSpacers(
    items: Array<{value: number; color?: string; theme?: ProgressProps['theme']}>,
    {
        spaceSize = 1,
        startSpace,
        endSpace,
    }: {spaceSize?: number; startSpace?: boolean; endSpace?: boolean} = {},
) {
    const res: typeof items = [];
    let sum = 100;

    function addSpacer() {
        res.push({value: spaceSize, color: 'rgba(0,0,0,0)'});
        sum += spaceSize;
    }

    for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        if (item.value > 0) {
            if (startSpace || res.length) {
                addSpacer();
            }
            res.push(item);
        }
    }

    if (endSpace) {
        addSpacer();
    }

    return res.map((item) => {
        return {...item, value: (item.value / sum) * 100};
    });
}
