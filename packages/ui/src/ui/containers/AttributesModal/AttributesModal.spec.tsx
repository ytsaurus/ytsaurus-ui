/** @jest-environment jsdom */
import React from 'react';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

jest.mock('@ytsaurus/components', () => ({
    Hotkey: () => null,
    setLang: () => {},
    Tooltip: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('../../components/Icon/Icon', () => () => null);
jest.mock('../../common/thor/unipika', () => ({
    __esModule: true,
    default: {decode: String, prepareSettings: () => ({})},
}));
jest.mock('../Block/Block', () => ({YTErrorBlock: () => null}));
jest.mock('../../components/Yson/Yson', () => ({
    Yson: () => null,
    YsonSettingsPropTypes: require('prop-types').object,
}));
jest.mock('../../components/DownloadAttributesButton', () => ({
    DownloadFileButton: () => null,
}));
jest.mock('../../components/DownloadAttributesButton/helpers/attributesToString', () => ({
    attributesToString: () => '',
}));

import ClickableAttributesButton from '../../components/AttributesButton/ClickableAttributesButton';
import modals from '../../store/reducers/modals';
import AttributesModal from './AttributesModal';

window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;

it('keeps the connected inspection modal title out of the close tooltip', async () => {
    const store = configureStore({reducer: combineReducers({modals})});
    (window as typeof window & {store: typeof store}).store = store;

    render(
        <Provider store={store}>
            <ThemeProvider theme="light">
                <ClickableAttributesButton title="State value" attributes={{nested: true}} />
                <AttributesModal />
            </ThemeProvider>
        </Provider>,
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
        expect(screen.getByText('State value')).not.toBeNull();
    });

    expect(document.querySelector('.elements-modal__header')?.getAttribute('title')).toBeNull();
});
