import '../src/ui/appearance';
import '../src/ui/common/hammer';

import {configure} from '@gravity-ui/uikit';

import {initialize, mswLoader} from 'msw-storybook-addon';
import {Preview} from '@storybook/react';

import {WithStrictMode} from './decorators/withStrictMode';
import {WithThemeAndModals} from './decorators/withThemeAndModals';
import {WithRouter} from './decorators/withRouter';
import {WithStore} from './decorators/withStore';
import {WithDashboard} from './decorators/withDashboard';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import '../src/ui/legacy-styles/legacy.scss';
import '../src/ui/styles/redefinitions/redefinitions.scss';
import '../src/ui/containers/App/App.scss';

configure({lang: 'en'});

initialize();

const preview: Preview = {
    loaders: [mswLoader],
    decorators: [WithRouter, WithStrictMode, WithThemeAndModals, WithStore, WithDashboard],
    parameters: {
        jsx: {showFunctions: true}, // To show functions in sources
        options: {
            storySort: {
                order: [
                    'Components',
                    'Pages',
                    ['Overview'],
                ],
                method: 'alphabetical',
            },
        },
    },
    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                    {value: 'light-hc', right: '☼', title: 'Light (high contrast)'},
                    {value: 'dark-hc', right: '☾', title: 'Dark (high contrast)'},
                ],
                dynamicTitle: true,
            },
        },
    },
};

export default preview;
