import {create} from 'storybook/theming';
import type {ThemeVarsPartial} from 'storybook/theming';

function renderBrandTitle(theme: 'light' | 'dark') {
    const titleColor = theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
    return `
<div style="display: flex; align-items: flex-start">
    <div style="margin-inline-start: 8px">
        <div style="font-size: 26px; line-height: 32px; color: ${titleColor}; font-weight: 600;">YTsaurus</div>
    </div>
</div>
    `.trim();
}

const common: Omit<ThemeVarsPartial, 'base'> = {
    // Typography
    fontBase: '"Helvetica Neue", Arial, Helvetica, sans-serif',
    fontCode:
        '"SF Mono", "Menlo", "Monaco", "Consolas", "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", "Courier", monospace',

    brandUrl: 'https://ytsaurus.tech/',
};

export const ThemeLight = create({
    base: 'light',
    ...common,
    brandTitle: renderBrandTitle('light'),
});

export const ThemeDark = create({
    base: 'dark',
    ...common,
    brandTitle: renderBrandTitle('dark'),
});

export const themes = {
    light: ThemeLight,
    dark: ThemeDark,
};
