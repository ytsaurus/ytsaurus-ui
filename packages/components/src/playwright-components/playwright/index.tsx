import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/unipika/dist/unipika.css';
import '@gravity-ui/illustrations/styles/styles.scss';

import React from 'react';
import {beforeMount} from '@playwright/experimental-ct-react/hooks';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

import '../../styles/theme-default.scss';

configure({lang: 'en'});

beforeMount(async ({App}) => {
    return (
        <ThemeProvider>
            <div className="yt-components-root">
                <App />
            </div>
        </ThemeProvider>
    );
});
