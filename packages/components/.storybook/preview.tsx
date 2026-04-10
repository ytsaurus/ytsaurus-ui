import type {Decorator, Preview} from '@storybook/react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/unipika/dist/unipika.css';
import '@gravity-ui/illustrations/styles/styles.scss';

import '../theme-default/theme-default.scss';

configure({lang: 'en'});

const withYtComponentsTheme: Decorator = (Story, context) => {
    const globalsTheme = context.globals.theme;
    const isDark = globalsTheme === 'dark';
    const uikitTheme = isDark ? 'dark' : 'light';
    const rootClassName = isDark
        ? 'yt-components-root yt-components-root_theme_dark'
        : 'yt-components-root';

    return (
        <ThemeProvider theme={uikitTheme}>
            <div className={rootClassName}>
                <Story />
            </div>
        </ThemeProvider>
    );
};

const preview: Preview = {
    decorators: [withYtComponentsTheme],
    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {
        layout: 'centered',
    },
};

export default preview;
