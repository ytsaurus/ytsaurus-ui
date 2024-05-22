import _sortedIndexBy from 'lodash/sortedIndexBy';
import type {ProgressTheme} from '@gravity-ui/uikit';

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

export function progressText(usage?: number, limit?: number, {type}: {type?: 'bytes'} = {}) {
    const formatFn = type === 'bytes' ? format.Bytes : format.Number;
    return `${formatFn(usage)} / ${formatFn(limit)}`;
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
    const index = _sortedIndexBy(
        thresholds,
        {max: Number.isFinite(progress) ? progress : 0} as ThemeThreshold,
        'max',
    );

    return thresholds[index].theme;
}
