import {generateColor, type useThemeType} from '@gravity-ui/uikit';

export type ChartTheme = ReturnType<typeof useThemeType>;

const DEFAULT_CHART_THEME: ChartTheme = 'dark';

export const CHART_SERIE_COLORS = [
    'var(--red-color)',
    'var(--yellow-color)',
    'var(--orange-color)',
    'var(--pale-yellow-color)',
    'var(--green-color)',
    'var(--cyan-color)',
    'var(--lime-color)',
    'var(--blue-color)',
    'var(--purple-color)',
    'var(--pink-color)',
];

const rgbToCss = (rgb: {r: number; g: number; b: number}): string =>
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

export const getSerieColor = (index: number, theme: ChartTheme = DEFAULT_CHART_THEME): string => {
    if (index < CHART_SERIE_COLORS.length) {
        return CHART_SERIE_COLORS[index];
    }

    const {rgb} = generateColor({
        seed: `${index}`,
        theme,
    });

    return rgbToCss(rgb);
};
