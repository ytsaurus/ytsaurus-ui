import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {Decorator} from '@storybook/react';

import {AppThemeFont} from '../../src/ui/containers/App/AppThemeFont';
import ModalErrors from '../../src/ui/containers/ModalErrors/ModalErrors';

export const WithThemeAndModals: Decorator = (Story, context) => {
    return (
        <ThemeProvider theme={context.globals.theme}>
            <AppThemeFont theme={context.globals.theme}>
                <ModalErrors />
                <Story {...context} />
            </AppThemeFont>
        </ThemeProvider>
    );
};