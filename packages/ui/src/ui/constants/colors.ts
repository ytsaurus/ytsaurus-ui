import {type ThemeType, generateColor} from '@gravity-ui/uikit';

export const SERIE_COLORS = [
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
] as const;

const rgbToCss = (rgb: {r: number; g: number; b: number}): string =>
    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

export const getSerieColor = (index: number, theme: ThemeType = 'light'): string => {
    if (index < SERIE_COLORS.length) {
        return SERIE_COLORS[index];
    }

    const {rgb} = generateColor({
        seed: `${index}`,
        theme,
    });

    return rgbToCss(rgb);
};

export const getDefaultSerieColor = (index: number): (typeof SERIE_COLORS)[number] => {
    return SERIE_COLORS[index % SERIE_COLORS.length];
};
