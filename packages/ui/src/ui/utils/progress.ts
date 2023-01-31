import _sortedIndexBy from 'lodash/sortedIndexBy';
import type {ProgressTheme} from '@gravity-ui/uikit';

export function computeProgress(total = 0, limit = 0) {
    let progress;

    if (limit > 0) {
        progress = (total / limit) * 100;
    } else {
        progress = total > 0 ? 100 : 0;
    }

    return Math.max(0, Math.min(progress, 100));
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
    progress: number,
    thresholds: ThemeThreshold[] = defaultThemeThresholds,
): ProgressTheme {
    const index = _sortedIndexBy(
        thresholds,
        {max: Number.isFinite(progress) ? progress : 0} as ThemeThreshold,
        'max',
    );

    return thresholds[index].theme;
}
