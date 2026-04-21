import React, {useCallback} from 'react';
// Импортируем чистую функцию и хук для получения текущего значения темы ('light' | 'dark')
import {type ThemeType, generateColor, useThemeValue} from '@gravity-ui/uikit';

export type {ChartKitProps, ChartKitWidget, ChartKitRef} from './YTChartKit';
export type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import withLazyLoading from '../../hocs/withLazyLoading';
import {type YTChartKitType} from './YTChartKit';

export const YTChartKitLazy = withLazyLoading(
    React.lazy(async () => import(/* webpackChunkName: 'chart-kit' */ './YTChartKit')),
) as YTChartKitType;

/**
 * Хук, возвращающий функцию генерации консистентных цветов для линий графиков
 */
export function useSerieColor() {
    // 1. Получаем текущую тему из контекста Gravity UI
    const theme = useThemeValue() as ThemeType;

    return useCallback(
        (serieIndex: number): string => {
            // 2. Вызываем чистую функцию, передавая и seed, и theme
            const {rgb} = generateColor({
                seed: String(serieIndex),
                theme,
            });

            // 3. Собираем валидную строку цвета. Yagr работает на Canvas,
            // поэтому формат rgb(r, g, b) для него идеально подходит.
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        },
        [theme], // Функция будет пересоздана (а графики перерисованы) при смене темы
    );
}

export {YTChartKitPie} from './YTChartKitPie';
export {YTChartKitHistogram} from './YTChartKitHistogram';
