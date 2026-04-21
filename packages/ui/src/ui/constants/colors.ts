export const STACKED_PROGRESS_BAR_COLORS = [
    'var(--red-color)',
    'var(--orange-color)',
    'var(--yellow-color)',
    'var(--pale-yellow-color)',
    'var(--green-color)',
    'var(--cyan-color)',
    'var(--lime-color)',
    'var(--blue-color)',
    'var(--purple-color)',
    'var(--pink-color)',
];

export function getProgressBarColorByIndex(index: number, offset = 4) {
    return STACKED_PROGRESS_BAR_COLORS[(offset + index) % STACKED_PROGRESS_BAR_COLORS.length];
}

import {useCallback} from 'react';
import {type ThemeType, generateColor, useThemeValue} from '@gravity-ui/uikit';

/**
 * Хук для генерации консистентных цветов прогресс-баров.
 * Заменяет старый метод getProgressBarColorByIndex и хардкод STACKED_PROGRESS_BAR_COLORS.
 */
export function useProgressBarColor() {
    // Получаем текущую тему (светлая/тёмная)
    const theme = useThemeValue() as ThemeType;
    return useCallback(
        (index: number, offset = 4): string => {
            // Чтобы сохранить логику смещения (offset),
            // мы просто складываем индекс со смещением для формирования seed
            const seed = String(index + offset);

            const {rgb} = generateColor({
                seed,
                theme,
            });

            // Возвращаем валидную CSS-строку цвета
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        },
        [theme],
    );
}
