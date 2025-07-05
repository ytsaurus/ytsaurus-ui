import React, {ReactElement} from 'react';
import {RenderOptions, render} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {ThemeProvider} from '@gravity-ui/uikit';
import {makeRootReducer} from '../store/reducers/index.main';

const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: makeRootReducer(),
        preloadedState: initialState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialState?: any;
    store?: ReturnType<typeof createTestStore>;
}

const customRender = (
    ui: ReactElement,
    {
        initialState = {},
        store = createTestStore(initialState),
        ...renderOptions
    }: CustomRenderOptions = {},
) => {
    const Wrapper = ({children}: {children: React.ReactNode}) => {
        return (
            <Provider store={store}>
                <ThemeProvider theme="light">{children}</ThemeProvider>
            </Provider>
        );
    };

    return render(ui, {wrapper: Wrapper, ...renderOptions});
};

export * from '@testing-library/react';
export {customRender as render, createTestStore};
