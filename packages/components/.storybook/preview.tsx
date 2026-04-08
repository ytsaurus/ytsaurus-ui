import type {Preview} from '@storybook/react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/unipika/dist/unipika.css';
import '@gravity-ui/illustrations/styles/styles.scss';

import '../src/styles/theme-default.scss';

configure({lang: 'en'});

const preview: Preview = {
    decorators: [
        (Story) => (
            <ThemeProvider theme="light">
                <div className="yt-components-root">
                    <Story />
                </div>
            </ThemeProvider>
        ),
    ],
    parameters: {
        layout: 'centered',
    },
};

export default preview;
