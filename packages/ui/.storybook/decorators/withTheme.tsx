import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Decorator} from '@storybook/react';

import {AppThemeFont} from '../../src/ui/containers/App/AppThemeFont';

export const WithTheme: Decorator = (Story, context) => {
    return (
        <ThemeProvider theme={context.globals.theme}>
            <AppThemeFont theme={context.globals.theme}>
                <Story {...context} />
            </AppThemeFont>
        </ThemeProvider>
    );
};