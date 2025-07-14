import {Provider} from 'react-redux';
import type {Decorator} from '@storybook/react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {appReducers} from '../../src/ui/store/reducers/index.main';
import {rootApi} from '../../src/ui/store/api';
import {configureUIFactory} from '../../src/ui/UIFactory';
import {defaultUIFactory} from '../../src/ui/UIFactory/default-ui-factory';

export const WithStore: Decorator = (Story, context) => {
    configureUIFactory(defaultUIFactory);
    const store = configureStore({
        reducer: combineReducers(appReducers),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({serializableCheck: false})
                .concat(rootApi.middleware),
        devTools: process.env.NODE_ENV !== 'production',
    });
    context.parameters?.store?.setStore?.(store);
    return (
        <Provider store={store}>
            <Story {...context} />
        </Provider>
    );
};
